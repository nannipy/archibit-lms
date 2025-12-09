'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Role } from '@prisma/client';

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

export async function toggleUserRole(userId: string, currentRole: Role) {
    const admin = await checkAdmin();

    // Prevent self-demotion
    if (admin.id === userId) {
        throw new Error('Cannot change your own role');
    }

    const newRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
    });

    revalidatePath('/admin/users');
}
