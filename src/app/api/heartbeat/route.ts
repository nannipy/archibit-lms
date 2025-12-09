import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user from Supabase
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { lessonId, currentTime, maxViewedTime, playbackRate, isVisible } = body;

        // ===== SECURITY: Validate playback rate =====
        if (playbackRate !== 1.0) {
            console.warn(`Playback rate manipulation detected for user ${user.id}: ${playbackRate}`);
            return NextResponse.json(
                { error: 'Invalid playback rate. Must be 1.0x' },
                { status: 400 }
            );
        }

        // Validate lesson exists and user is enrolled
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: {
                    include: {
                        enrollments: {
                            where: { userId: user.id },
                        },
                    },
                },
            },
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        if (lesson.course.enrollments.length === 0) {
            return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
        }

        // Get previous max viewed time
        const previousLog = await prisma.viewingLog.findFirst({
            where: {
                userId: user.id,
                lessonId,
            },
            orderBy: {
                maxViewedTime: 'desc',
            },
        });

        const previousMax = previousLog?.maxViewedTime || 0;

        // Only update maxViewedTime if it's actually higher
        const newMaxViewedTime = Math.max(maxViewedTime, previousMax);

        // Create viewing log entry
        const viewingLog = await prisma.viewingLog.create({
            data: {
                userId: user.id,
                lessonId,
                currentTime: Math.floor(currentTime),
                maxViewedTime: Math.floor(newMaxViewedTime),
                playbackRate,
                isVisible,
            },
        });

        // Calculate lesson progress
        const progressPercentage = Math.min(
            (newMaxViewedTime / lesson.videoDuration) * 100,
            100
        );

        // Update enrollment progress
        const enrollment = lesson.course.enrollments[0];

        // Get all lessons for this course
        const allLessons = await prisma.lesson.findMany({
            where: { courseId: lesson.courseId },
        });

        // Calculate overall course progress
        const lessonProgresses = await Promise.all(
            allLessons.map(async (l) => {
                const maxLog = await prisma.viewingLog.findFirst({
                    where: {
                        userId: user.id,
                        lessonId: l.id,
                    },
                    orderBy: {
                        maxViewedTime: 'desc',
                    },
                });

                const lessonMax = maxLog?.maxViewedTime || 0;
                return Math.min((lessonMax / l.videoDuration) * 100, 100);
            })
        );

        const overallProgress =
            lessonProgresses.reduce((sum, p) => sum + p, 0) / allLessons.length;

        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
                progress: overallProgress,
                completedAt: overallProgress >= 100 ? new Date() : null,
            },
        });

        return NextResponse.json({
            success: true,
            lessonProgress: progressPercentage,
            courseProgress: overallProgress,
            maxViewedTime: newMaxViewedTime,
        });
    } catch (error) {
        console.error('Heartbeat error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
