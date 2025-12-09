'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function enrollUser(courseId: string) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 1. Verify Course Exists & Price
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        throw new Error('Course not found');
    }

    // 2. Mock Payment Logic (Since we are moving from client-side mock)
    // In a real app, we would create a Stripe Checkout Session here and return the URL.
    // For now, we simulate a successful "free" purchase or "mock" credit card on server.

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: user.id,
                courseId: course.id,
            },
        },
    });

    if (existingEnrollment) {
        return { success: true, message: 'Already enrolled' };
    }

    try {
        // Transaction: Create Purchase + Enrollment
        await prisma.$transaction([
            prisma.purchase.create({
                data: {
                    userId: user.id,
                    courseId: course.id,
                    amount: course.price,
                    status: 'COMPLETED', // Auto-complete for mock
                }
            }),
            prisma.enrollment.create({
                data: {
                    userId: user.id,
                    courseId: course.id,
                    progress: 0,
                }
            })
        ]);

        revalidatePath('/courses');
        return { success: true };
    } catch (error) {
        console.error('Enrollment error:', error);
        return { success: false, error: 'Failed to enroll' };
    }
}
