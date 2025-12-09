import { MockEnrollment, STORAGE_KEYS, getCourseById } from './mock-data';
import { getSession } from './mock-auth';

// Get user's enrollments
export function getUserEnrollments(userId: string): MockEnrollment[] {
    if (typeof window === 'undefined') return [];

    const enrollmentsJson = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    if (!enrollmentsJson) return [];

    try {
        const allEnrollments: MockEnrollment[] = JSON.parse(enrollmentsJson);
        return allEnrollments.filter(e => e.userId === userId);
    } catch {
        return [];
    }
}

// Check if user is enrolled in a course
export function isEnrolled(userId: string, courseId: string): boolean {
    const enrollments = getUserEnrollments(userId);
    return enrollments.some(e => e.courseId === courseId);
}

// Enroll user in a course
export function enrollInCourse(courseId: string): boolean {
    const session = getSession();
    if (!session) return false;

    const userId = session.user.id;

    // Check if already enrolled
    if (isEnrolled(userId, courseId)) return true;

    // Get all enrollments
    const enrollmentsJson = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    const allEnrollments: MockEnrollment[] = enrollmentsJson
        ? JSON.parse(enrollmentsJson)
        : [];


    // Create new enrollment
    const newEnrollment: MockEnrollment = {
        userId,
        courseId,
        enrolledAt: new Date(),
        progress: 0,
        completedLessons: [],
    };

    allEnrollments.push(newEnrollment);
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(allEnrollments));

    return true;
}

// Get course progress
export function getCourseProgress(userId: string, courseId: string): number {
    const enrollments = getUserEnrollments(userId);
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress ?? 0;
}

// Mark lesson as complete
export function completeLesson(userId: string, courseId: string, lessonId: string): void {
    const enrollmentsJson = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
    if (!enrollmentsJson) return;

    const allEnrollments: MockEnrollment[] = JSON.parse(enrollmentsJson);
    const enrollment = allEnrollments.find(
        e => e.userId === userId && e.courseId === courseId
    );

    if (!enrollment) return;

    // Add lesson to completed if not already there
    if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);

        // Recalculate progress
        const course = getCourseById(courseId);
        if (course) {
            const totalLessons = course.lessons.length;
            const completedCount = enrollment.completedLessons.length;
            enrollment.progress = Math.round((completedCount / totalLessons) * 100);
        }

        localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(allEnrollments));
    }
}

// Get completed lessons for a course
export function getCompletedLessons(userId: string, courseId: string): string[] {
    const enrollments = getUserEnrollments(userId);
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.completedLessons ?? [];
}

// Check if lesson is completed
export function isLessonCompleted(userId: string, courseId: string, lessonId: string): boolean {
    const completedLessons = getCompletedLessons(userId, courseId);
    return completedLessons.includes(lessonId);
}

// Get all enrolled courses
export function getEnrolledCourses(userId: string) {
    const enrollments = getUserEnrollments(userId);
    return enrollments.map(enrollment => {
        const course = getCourseById(enrollment.courseId);
        return {
            ...course,
            enrollment,
        };
    }).filter(item => item !== undefined);
}
