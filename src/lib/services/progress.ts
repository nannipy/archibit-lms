import { prisma } from '@/lib/prisma'
import type { ViewingLog, QuizAttempt } from '@prisma/client'
import type { HeartbeatPayload, QuizSubmitPayload, QuizSubmitResponse } from '@/types'

// ===== VIEWING LOGS =====

/**
 * Log a heartbeat (viewing progress)
 */
export async function logHeartbeat(
    userId: string,
    data: HeartbeatPayload
): Promise<ViewingLog> {
    return prisma.viewingLog.create({
        data: {
            userId,
            lessonId: data.lessonId,
            currentTime: data.currentTime,
            maxViewedTime: data.maxViewedTime,
            playbackRate: data.playbackRate,
            isVisible: data.isVisible,
        },
    })
}

/**
 * Get viewing progress for a lesson
 */
export async function getViewingProgress(
    userId: string,
    lessonId: string
): Promise<{ currentTime: number; maxViewedTime: number } | null> {
    const lastLog = await prisma.viewingLog.findFirst({
        where: { userId, lessonId },
        orderBy: { timestamp: 'desc' },
        select: { currentTime: true, maxViewedTime: true },
    })
    return lastLog
}

/**
 * Get max viewed time for a lesson
 */
export async function getMaxViewedTime(userId: string, lessonId: string): Promise<number> {
    const result = await prisma.viewingLog.aggregate({
        where: { userId, lessonId },
        _max: { maxViewedTime: true },
    })
    return result._max.maxViewedTime ?? 0
}

// ===== QUIZ ATTEMPTS =====

/**
 * Submit a quiz attempt
 */
export async function submitQuizAttempt(
    userId: string,
    data: QuizSubmitPayload
): Promise<QuizSubmitResponse> {
    // Get the quiz marker to check the answer
    const quizMarker = await prisma.quizMarker.findUnique({
        where: { id: data.quizMarkerId },
    })

    if (!quizMarker) {
        throw new Error('Quiz marker not found')
    }

    const options = quizMarker.options as { text: string; isCorrect: boolean }[]
    const isCorrect = options[data.selectedOption]?.isCorrect ?? false

    // Record the attempt
    await prisma.quizAttempt.create({
        data: {
            userId,
            quizMarkerId: data.quizMarkerId,
            selectedOption: data.selectedOption,
            isCorrect,
        },
    })

    // If wrong, return the rewind timestamp
    return {
        isCorrect,
        rewindTo: isCorrect ? undefined : Math.max(0, quizMarker.timestamp - 30),
    }
}

/**
 * Get quiz attempts for a lesson
 */
export async function getQuizAttempts(
    userId: string,
    lessonId: string
): Promise<QuizAttempt[]> {
    return prisma.quizAttempt.findMany({
        where: {
            userId,
            quizMarker: { lessonId },
        },
        orderBy: { attemptedAt: 'desc' },
    })
}

/**
 * Check if user has passed all quizzes in a lesson
 */
export async function hasPassedAllQuizzes(
    userId: string,
    lessonId: string
): Promise<boolean> {
    // Get all quiz markers for the lesson
    const quizMarkers = await prisma.quizMarker.findMany({
        where: { lessonId },
        select: { id: true },
    })

    if (quizMarkers.length === 0) return true

    // Check if user has correct attempt for each
    for (const marker of quizMarkers) {
        const correctAttempt = await prisma.quizAttempt.findFirst({
            where: {
                userId,
                quizMarkerId: marker.id,
                isCorrect: true,
            },
        })
        if (!correctAttempt) return false
    }

    return true
}

/**
 * Get quiz statistics for analytics
 */
export async function getQuizStats(lessonId: string) {
    const attempts = await prisma.quizAttempt.findMany({
        where: {
            quizMarker: { lessonId },
        },
        select: { isCorrect: true },
    })

    const total = attempts.length
    const correct = attempts.filter(a => a.isCorrect).length

    return {
        totalAttempts: total,
        correctAttempts: correct,
        successRate: total > 0 ? Math.round((correct / total) * 100) : 0,
    }
}
