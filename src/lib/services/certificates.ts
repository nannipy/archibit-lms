import { prisma } from '@/lib/prisma'
import type { Certificate } from '@prisma/client'

// ===== QUERIES =====

/**
 * Get all certificates for a user
 */
export async function getUserCertificates(userId: string) {
    return prisma.certificate.findMany({
        where: { userId },
        include: { course: true },
        orderBy: { issuedAt: 'desc' },
    })
}

/**
 * Get a certificate by ID
 */
export async function getCertificateById(id: string): Promise<Certificate | null> {
    return prisma.certificate.findUnique({
        where: { id },
        include: { course: true, user: true },
    })
}

/**
 * Check if user has a certificate for a course
 */
export async function hasCertificate(userId: string, courseId: string): Promise<boolean> {
    const cert = await prisma.certificate.findUnique({
        where: {
            userId_courseId: { userId, courseId },
        },
    })
    return !!cert
}

// ===== MUTATIONS =====

/**
 * Generate a certificate for a user who completed a course
 */
export async function generateCertificate(
    userId: string,
    courseId: string,
    pdfUrl?: string
): Promise<Certificate> {
    // Check if certificate already exists
    const existing = await prisma.certificate.findUnique({
        where: {
            userId_courseId: { userId, courseId },
        },
    })

    if (existing) {
        return existing
    }

    // Create new certificate
    return prisma.certificate.create({
        data: {
            userId,
            courseId,
            pdfUrl,
        },
    })
}

/**
 * Update certificate PDF URL
 */
export async function updateCertificatePdf(
    id: string,
    pdfUrl: string
): Promise<Certificate> {
    return prisma.certificate.update({
        where: { id },
        data: { pdfUrl },
    })
}

/**
 * Get total certificates issued
 */
export async function getCertificateCount(): Promise<number> {
    return prisma.certificate.count()
}
