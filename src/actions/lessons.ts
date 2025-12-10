'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function completeLesson(lessonId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Upsert LessonProgress
        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lessonId
                }
            },
            update: {
                isCompleted: true,
                completedAt: new Date(),
            },
            create: {
                userId: user.id,
                lessonId: lessonId,
                isCompleted: true,
                completedAt: new Date(),
            }
        });

        revalidatePath('/courses');
        return { success: true };

    } catch (error) {
        console.error('Error completing lesson:', error);
        return { success: false, error: 'Failed to complete lesson' };
    }
}
