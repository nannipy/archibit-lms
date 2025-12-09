'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
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

export async function toggleCoursePublish(courseId: string, isPublished: boolean) {
    await checkAdmin();

    await prisma.course.update({
        where: { id: courseId },
        data: { isPublished },
    });

    revalidatePath('/admin/courses');
}

export async function deleteCourse(courseId: string) {
    await checkAdmin();

    await prisma.course.delete({
        where: { id: courseId },
    });

    revalidatePath('/admin/courses');
}
