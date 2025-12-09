import { prisma } from '@/lib/prisma'
import type { Lesson, QuizMarker } from '@prisma/client'

// ===== TYPES =====
export type LessonWithQuizzes = Lesson & {
    quizMarkers: QuizMarker[]
}

export type CreateLessonInput = {
    courseId: string
    title: string
    description?: string
    videoUrl: string
    videoDuration: number
    order: number
}

export type UpdateLessonInput = Partial<Omit<CreateLessonInput, 'courseId'>>

export type CreateQuizMarkerInput = {
    lessonId: string
    timestamp: number
    question: string
    options: { text: string; isCorrect: boolean }[]
}

// ===== QUERIES =====

/**
 * Get a single lesson by ID
 */
export async function getLessonById(id: string): Promise<Lesson | null> {
    return prisma.lesson.findUnique({
        where: { id },
    })
}

/**
 * Get lesson with quiz markers
 */
export async function getLessonWithQuizzes(id: string): Promise<LessonWithQuizzes | null> {
    return prisma.lesson.findUnique({
        where: { id },
        include: {
            quizMarkers: {
                orderBy: { timestamp: 'asc' },
            },
        },
    })
}

/**
 * Get all lessons for a course
 */
export async function getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
    return prisma.lesson.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
    })
}

/**
 * Get quiz marker by ID
 */
export async function getQuizMarkerById(id: string): Promise<QuizMarker | null> {
    return prisma.quizMarker.findUnique({
        where: { id },
    })
}

// ===== MUTATIONS =====

/**
 * Create a new lesson
 */
export async function createLesson(data: CreateLessonInput): Promise<Lesson> {
    return prisma.lesson.create({
        data,
    })
}

/**
 * Update a lesson
 */
export async function updateLesson(id: string, data: UpdateLessonInput): Promise<Lesson> {
    return prisma.lesson.update({
        where: { id },
        data,
    })
}

/**
 * Delete a lesson
 */
export async function deleteLesson(id: string): Promise<void> {
    await prisma.lesson.delete({
        where: { id },
    })
}

/**
 * Reorder lessons within a course
 */
export async function reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
    const updates = lessonIds.map((id, index) =>
        prisma.lesson.update({
            where: { id },
            data: { order: index + 1 },
        })
    )
    await prisma.$transaction(updates)
}

/**
 * Create a quiz marker
 */
export async function createQuizMarker(data: CreateQuizMarkerInput): Promise<QuizMarker> {
    return prisma.quizMarker.create({
        data: {
            lessonId: data.lessonId,
            timestamp: data.timestamp,
            question: data.question,
            options: data.options,
        },
    })
}

/**
 * Delete a quiz marker
 */
export async function deleteQuizMarker(id: string): Promise<void> {
    await prisma.quizMarker.delete({
        where: { id },
    })
}
