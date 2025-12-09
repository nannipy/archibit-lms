import { prisma } from '@/lib/prisma'
import type { Enrollment, Course } from '@prisma/client'

// ===== TYPES =====
export type EnrollmentWithCourse = Enrollment & {
    course: Course
}

// ===== QUERIES =====

/**
 * Get user's enrollments with course data
 */
export async function getUserEnrollments(userId: string): Promise<EnrollmentWithCourse[]> {
    return prisma.enrollment.findMany({
        where: { userId },
        include: { course: true },
        orderBy: { enrolledAt: 'desc' },
    })
}

/**
 * Check if user is enrolled in a course
 */
export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: { userId, courseId },
        },
    })
    return !!enrollment
}

/**
 * Get enrollment by user and course
 */
export async function getEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    return prisma.enrollment.findUnique({
        where: {
            userId_courseId: { userId, courseId },
        },
    })
}

/**
 * Get enrollment count
 */
export async function getEnrollmentCount(): Promise<number> {
    return prisma.enrollment.count()
}

/**
 * Get course completion rate
 */
export async function getCourseCompletionRate(courseId: string): Promise<number> {
    const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        select: { completedAt: true },
    })

    if (enrollments.length === 0) return 0

    const completed = enrollments.filter(e => e.completedAt !== null).length
    return Math.round((completed / enrollments.length) * 100)
}

// ===== MUTATIONS =====

/**
 * Enroll user in a course
 */
export async function enrollUser(userId: string, courseId: string): Promise<Enrollment> {
    return prisma.enrollment.create({
        data: {
            userId,
            courseId,
            progress: 0,
        },
    })
}

/**
 * Update enrollment progress
 */
export async function updateProgress(
    userId: string,
    courseId: string,
    progress: number
): Promise<Enrollment> {
    return prisma.enrollment.update({
        where: {
            userId_courseId: { userId, courseId },
        },
        data: { progress },
    })
}

/**
 * Complete an enrollment
 */
export async function completeEnrollment(userId: string, courseId: string): Promise<Enrollment> {
    return prisma.enrollment.update({
        where: {
            userId_courseId: { userId, courseId },
        },
        data: {
            progress: 100,
            completedAt: new Date(),
        },
    })
}

/**
 * Unenroll user from a course
 */
export async function unenrollUser(userId: string, courseId: string): Promise<void> {
    await prisma.enrollment.delete({
        where: {
            userId_courseId: { userId, courseId },
        },
    })
}
