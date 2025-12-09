import { prisma } from '@/lib/prisma'
import type { Course, Lesson, QuizMarker } from '@prisma/client'

// ===== TYPES =====
export type CourseWithLessons = Course & {
    lessons: (Lesson & {
        quizMarkers: QuizMarker[]
    })[]
}

export type CreateCourseInput = {
    title: string
    description: string
    price: number
    thumbnailUrl?: string
}

export type UpdateCourseInput = Partial<CreateCourseInput>

// ===== QUERIES =====

/**
 * Get all courses (for catalog)
 */
export async function getAllCourses(): Promise<Course[]> {
    return prisma.course.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

/**
 * Get a single course by ID
 */
export async function getCourseById(id: string): Promise<Course | null> {
    return prisma.course.findUnique({
        where: { id },
    })
}

/**
 * Get course with all lessons and quiz markers
 */
export async function getCourseWithLessons(id: string): Promise<CourseWithLessons | null> {
    return prisma.course.findUnique({
        where: { id },
        include: {
            lessons: {
                orderBy: { order: 'asc' },
                include: {
                    quizMarkers: {
                        orderBy: { timestamp: 'asc' },
                    },
                },
            },
        },
    })
}

/**
 * Get course count
 */
export async function getCourseCount(): Promise<number> {
    return prisma.course.count()
}

// ===== MUTATIONS =====

/**
 * Create a new course
 */
export async function createCourse(data: CreateCourseInput): Promise<Course> {
    return prisma.course.create({
        data: {
            title: data.title,
            description: data.description,
            price: data.price,
            thumbnailUrl: data.thumbnailUrl,
        },
    })
}

/**
 * Update a course
 */
export async function updateCourse(id: string, data: UpdateCourseInput): Promise<Course> {
    return prisma.course.update({
        where: { id },
        data,
    })
}

/**
 * Delete a course (cascades to lessons)
 */
export async function deleteCourse(id: string): Promise<void> {
    await prisma.course.delete({
        where: { id },
    })
}

/**
 * Get total revenue from all courses
 */
export async function getTotalRevenue(): Promise<number> {
    const result = await prisma.purchase.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
    })
    return result._sum.amount ?? 0
}
