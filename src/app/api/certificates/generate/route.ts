import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateCertificatePDF } from '@/lib/pdf/certificate-generator';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { courseId } = body;

        // Check if certificate already exists
        const existingCertificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId,
                },
            },
        });

        if (existingCertificate) {
            return NextResponse.json({
                certificateId: existingCertificate.id,
                pdfUrl: existingCertificate.pdfUrl,
                message: 'Certificate already exists',
            });
        }

        // Get course with lessons and quiz markers
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lessons: {
                    include: {
                        quizMarkers: true,
                    },
                },
                enrollments: {
                    where: { userId: user.id },
                },
            },
        });

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        if (course.enrollments.length === 0) {
            return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
        }

        // ===== VALIDATION 1: Check all quizzes are passed =====
        const allQuizMarkers = course.lessons.flatMap(lesson => lesson.quizMarkers);

        for (const quizMarker of allQuizMarkers) {
            const correctAttempt = await prisma.quizAttempt.findFirst({
                where: {
                    userId: user.id,
                    quizMarkerId: quizMarker.id,
                    isCorrect: true,
                },
            });

            if (!correctAttempt) {
                return NextResponse.json({
                    error: 'All quiz questions must be answered correctly before generating certificate',
                    missingQuiz: quizMarker.question,
                }, { status: 400 });
            }
        }

        // ===== VALIDATION 2: Check total watch time =====
        const totalRequiredDuration = course.lessons.reduce(
            (sum, lesson) => sum + lesson.videoDuration,
            0
        );

        // Calculate total watch time across all lessons
        let totalWatchTime = 0;
        for (const lesson of course.lessons) {
            const maxLog = await prisma.viewingLog.findFirst({
                where: {
                    userId: user.id,
                    lessonId: lesson.id,
                },
                orderBy: {
                    maxViewedTime: 'desc',
                },
            });

            totalWatchTime += maxLog?.maxViewedTime || 0;
        }

        // Require at least 95% of total video duration
        const requiredWatchTime = totalRequiredDuration * 0.95;

        if (totalWatchTime < requiredWatchTime) {
            return NextResponse.json({
                error: 'Insufficient watch time. Please complete watching all course videos.',
                watchedPercentage: Math.round((totalWatchTime / totalRequiredDuration) * 100),
                requiredPercentage: 95,
            }, { status: 400 });
        }

        // ===== GENERATE CERTIFICATE =====
        const certificateId = `CERT-${Date.now()}-${user.id.slice(0, 8)}`;

        const pdfBuffer = await generateCertificatePDF({
            userName: user.name || user.email,
            courseName: course.title,
            completionDate: new Date(),
            certificateId,
        });

        // Save PDF to public/certificates directory
        const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
        await mkdir(certificatesDir, { recursive: true });

        const filename = `${certificateId}.pdf`;
        const filepath = path.join(certificatesDir, filename);
        await writeFile(filepath, pdfBuffer);

        const pdfUrl = `/certificates/${filename}`;

        // Create certificate record
        const certificate = await prisma.certificate.create({
            data: {
                userId: user.id,
                courseId,
                pdfUrl,
            },
        });

        // Mark enrollment as completed
        await prisma.enrollment.update({
            where: { id: course.enrollments[0].id },
            data: {
                completedAt: new Date(),
                progress: 100,
            },
        });

        return NextResponse.json({
            certificateId: certificate.id,
            pdfUrl: certificate.pdfUrl,
            message: 'Certificate generated successfully',
        });
    } catch (error) {
        console.error('Certificate generation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
