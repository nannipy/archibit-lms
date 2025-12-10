'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function validateCoupon(code: string, courseId: string) {
    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!coupon) {
        return { valid: false, message: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
        return { valid: false, message: 'Coupon is inactive' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return { valid: false, message: 'Coupon expired' };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, message: 'Coupon usage limit reached' };
    }

    if (coupon.courseId && coupon.courseId !== courseId) {
        return { valid: false, message: 'Coupon not valid for this course' };
    }

    return { valid: true, coupon };
}

export async function enrollUser(courseId: string, couponCode?: string) {
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

    // Determine Base Price (considering course discount)
    let finalPrice = course.price;
    const hasCourseDiscount = course.discountPrice !== null && course.discountPrice !== undefined &&
        (course.discountExpiresAt === null || course.discountExpiresAt === undefined || new Date(course.discountExpiresAt) > new Date());

    if (hasCourseDiscount) {
        finalPrice = course.discountPrice!;
    }

    // 2. Validate Coupon if provided
    let couponId = null;
    if (couponCode) {
        const validation = await validateCoupon(couponCode, courseId);
        if (!validation.valid || !validation.coupon) {
            return { success: false, message: validation.message, error: validation.message };
        }

        const coupon = validation.coupon;
        couponId = coupon.id;

        // Apply Coupon Discount
        if (coupon.discountType === 'PERCENTAGE') {
            finalPrice = finalPrice - (finalPrice * (coupon.discountValue / 100));
        } else {
            finalPrice = finalPrice - coupon.discountValue;
        }

        // Ensure price doesn't go below 0
        if (finalPrice < 0) finalPrice = 0;
    }

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
        // Transaction: Create Purchase + Enrollment + Increment Coupon Usage
        await prisma.$transaction(async (tx) => {
            await tx.purchase.create({
                data: {
                    userId: user.id,
                    courseId: course.id,
                    amount: finalPrice,
                    status: 'COMPLETED',
                    couponId: couponId
                }
            });

            await tx.enrollment.create({
                data: {
                    userId: user.id,
                    courseId: course.id,
                    progress: 0,
                }
            });

            if (couponId) {
                await tx.coupon.update({
                    where: { id: couponId },
                    data: { usedCount: { increment: 1 } }
                });
            }
        });

        revalidatePath('/courses');
        return { success: true };
    } catch (error) {
        console.error('Enrollment error:', error);
        return { success: false, error: 'Failed to enroll' };
    }
}
