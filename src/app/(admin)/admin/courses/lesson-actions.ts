'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({
        where: { id: authUser.id },
    });

    if (!user || user.role !== 'ADMIN') {
        throw new Error('Forbidden');
    }
    return user;
}

export async function createLesson(formData: FormData) {
    await checkAdmin();

    const courseId = formData.get('courseId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const videoDuration = parseInt(formData.get('videoDuration') as string);
    const order = parseInt(formData.get('order') as string);

    await prisma.lesson.create({
        data: {
            courseId,
            title,
            description,
            videoUrl,
            videoDuration,
            order,
        },
    });

    revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
    await checkAdmin();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const videoDuration = parseInt(formData.get('videoDuration') as string);
    const order = parseInt(formData.get('order') as string);

    await prisma.lesson.update({
        where: { id: lessonId },
        data: {
            title,
            description,
            videoUrl,
            videoDuration,
            order,
        },
    });

    revalidatePath(`/admin/courses/${courseId}`);
    redirect(`/admin/courses/${courseId}`);
}

export async function deleteLesson(lessonId: string, courseId: string) {
    await checkAdmin();

    await prisma.lesson.delete({
        where: { id: lessonId },
    });

    revalidatePath(`/admin/courses/${courseId}`);
}
