export interface QuizOption {
    text: string;
    isCorrect: boolean;
}

export interface QuizMarker {
    id: string;
    lessonId: string;
    timestamp: number;
    question: string;
    options: QuizOption[];
}

export interface ViewingProgress {
    lessonId: string;
    currentTime: number;
    maxViewedTime: number;
    playbackRate: number;
    isVisible: boolean;
}

export interface HeartbeatPayload {
    lessonId: string;
    currentTime: number;
    maxViewedTime: number;
    playbackRate: number;
    isVisible: boolean;
}

export interface QuizSubmitPayload {
    quizMarkerId: string;
    selectedOption: number;
}

export interface QuizSubmitResponse {
    isCorrect: boolean;
    rewindTo?: number;
}

export interface CertificateGeneratePayload {
    courseId: string;
}

export interface CertificateGenerateResponse {
    certificateId: string;
    pdfUrl: string;
}

export interface CourseProgress {
    courseId: string;
    progress: number;
    totalWatchTime: number;
    completedLessons: number;
    totalLessons: number;
    quizzesPassed: number;
    quizzesTotal: number;
}
