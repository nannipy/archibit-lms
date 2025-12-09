export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            User: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    password: string
                    role: 'STUDENT' | 'ADMIN'
                    createdAt: string
                    updatedAt: string
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    password: string
                    role?: 'STUDENT' | 'ADMIN'
                    createdAt?: string
                    updatedAt?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    password?: string
                    role?: 'STUDENT' | 'ADMIN'
                    createdAt?: string
                    updatedAt?: string
                }
            }
            Course: {
                Row: {
                    id: string
                    title: string
                    description: string
                    price: number
                    thumbnailUrl: string | null
                    createdAt: string
                    updatedAt: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    price: number
                    thumbnailUrl?: string | null
                    createdAt?: string
                    updatedAt?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    price?: number
                    thumbnailUrl?: string | null
                    createdAt?: string
                    updatedAt?: string
                }
            }
            Lesson: {
                Row: {
                    id: string
                    courseId: string
                    title: string
                    description: string | null
                    videoUrl: string
                    videoDuration: number
                    order: number
                    createdAt: string
                }
                Insert: {
                    id?: string
                    courseId: string
                    title: string
                    description?: string | null
                    videoUrl: string
                    videoDuration: number
                    order: number
                    createdAt?: string
                }
                Update: {
                    id?: string
                    courseId?: string
                    title?: string
                    description?: string | null
                    videoUrl?: string
                    videoDuration?: number
                    order?: number
                    createdAt?: string
                }
            }
            QuizMarker: {
                Row: {
                    id: string
                    lessonId: string
                    timestamp: number
                    question: string
                    options: Json
                }
                Insert: {
                    id?: string
                    lessonId: string
                    timestamp: number
                    question: string
                    options: Json
                }
                Update: {
                    id?: string
                    lessonId?: string
                    timestamp?: number
                    question?: string
                    options?: Json
                }
            }
            Enrollment: {
                Row: {
                    id: string
                    userId: string
                    courseId: string
                    enrolledAt: string
                    completedAt: string | null
                    progress: number
                }
                Insert: {
                    id?: string
                    userId: string
                    courseId: string
                    enrolledAt?: string
                    completedAt?: string | null
                    progress?: number
                }
                Update: {
                    id?: string
                    userId?: string
                    courseId?: string
                    enrolledAt?: string
                    completedAt?: string | null
                    progress?: number
                }
            }
            Purchase: {
                Row: {
                    id: string
                    userId: string
                    courseId: string
                    amount: number
                    status: 'PENDING' | 'COMPLETED' | 'FAILED'
                    purchasedAt: string
                }
                Insert: {
                    id?: string
                    userId: string
                    courseId: string
                    amount: number
                    status?: 'PENDING' | 'COMPLETED' | 'FAILED'
                    purchasedAt?: string
                }
                Update: {
                    id?: string
                    userId?: string
                    courseId?: string
                    amount?: number
                    status?: 'PENDING' | 'COMPLETED' | 'FAILED'
                    purchasedAt?: string
                }
            }
            ViewingLog: {
                Row: {
                    id: string
                    userId: string
                    lessonId: string
                    currentTime: number
                    maxViewedTime: number
                    playbackRate: number
                    isVisible: boolean
                    timestamp: string
                }
                Insert: {
                    id?: string
                    userId: string
                    lessonId: string
                    currentTime: number
                    maxViewedTime: number
                    playbackRate?: number
                    isVisible?: boolean
                    timestamp?: string
                }
                Update: {
                    id?: string
                    userId?: string
                    lessonId?: string
                    currentTime?: number
                    maxViewedTime?: number
                    playbackRate?: number
                    isVisible?: boolean
                    timestamp?: string
                }
            }
            QuizAttempt: {
                Row: {
                    id: string
                    userId: string
                    quizMarkerId: string
                    selectedOption: number
                    isCorrect: boolean
                    attemptedAt: string
                }
                Insert: {
                    id?: string
                    userId: string
                    quizMarkerId: string
                    selectedOption: number
                    isCorrect: boolean
                    attemptedAt?: string
                }
                Update: {
                    id?: string
                    userId?: string
                    quizMarkerId?: string
                    selectedOption?: number
                    isCorrect?: boolean
                    attemptedAt?: string
                }
            }
            Certificate: {
                Row: {
                    id: string
                    userId: string
                    courseId: string
                    pdfUrl: string | null
                    issuedAt: string
                }
                Insert: {
                    id?: string
                    userId: string
                    courseId: string
                    pdfUrl?: string | null
                    issuedAt?: string
                }
                Update: {
                    id?: string
                    userId?: string
                    courseId?: string
                    pdfUrl?: string | null
                    issuedAt?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            Role: 'STUDENT' | 'ADMIN'
            PurchaseStatus: 'PENDING' | 'COMPLETED' | 'FAILED'
        }
    }
}
