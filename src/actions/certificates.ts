'use server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function issueCertificate(courseId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Check if certificate already exists
        const existingCert = await prisma.certificate.findFirst({
            where: {
                userId: user.id,
                courseId: courseId
            }
        });

        if (existingCert) {
            return { success: true, certificateId: existingCert.id };
        }

        // Verify course completion (optional but good for security)
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId: user.id,
                courseId: courseId
            }
        });

        if (!enrollment) {
            return { success: false, error: 'Not enrolled' };
        }

        // Mark course as completed if not already
        if (!enrollment.completedAt) {
            await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { completedAt: new Date() }
            });
        }

        // Create certificate
        const newCert = await prisma.certificate.create({
            data: {
                userId: user.id,
                courseId: courseId,
                issuedAt: new Date(),
            }
        });

        revalidatePath('/admin/dashboard');
        revalidatePath('/certificates');

        return { success: true, certificateId: newCert.id };

    } catch (error) {
        console.error('Error issuing certificate:', error);
        return { success: false, error: 'Failed to issue certificate' };
    }
}
