'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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

export async function deleteCoupon(couponId: string) {
    await checkAdmin();

    await prisma.coupon.delete({
        where: { id: couponId },
    });

    revalidatePath('/admin/coupons');
}
