'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
// import { CourseDetailSkeleton } from '@/components/skeletons/CourseDetailSkeleton'; // Not used in client component
import { PaymentModal } from '@/components/payment/PaymentModal';
import { enrollUser } from '@/actions/enroll';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Lesson {
    id: string;
    title: string;
    description: string | null;
    videoDuration: number;
    quizMarkersCount: number;
}

interface CourseDetailClientProps {
    course: {
        id: string;
        title: string;
        description: string;
        price: number;
        discountPrice?: number | null;
        discountExpiresAt?: Date | null;
        thumbnailUrl?: string | null;
        lessons: Lesson[];
    };
    enrollment: {
        id: string;
        progress: number;
        completedAt: Date | null;
    } | null;
    completedLessonIds: string[];
}

export function CourseDetailClient({ course, enrollment, completedLessonIds }: CourseDetailClientProps) {
    const router = useRouter();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    
    const isEnrolled = !!enrollment;
    const progress = enrollment?.progress || 0;
    const completedSet = new Set(completedLessonIds);

    const totalDuration = course.lessons.reduce((sum, lesson) => sum + (lesson.videoDuration || 0), 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    // Calculate Discount
    const hasDiscount = course.discountPrice !== null && course.discountPrice !== undefined && 
        (course.discountExpiresAt === null || course.discountExpiresAt === undefined || new Date(course.discountExpiresAt) > new Date());
    
    const effectivePrice = hasDiscount ? course.discountPrice! : course.price;
    const isFree = effectivePrice === 0;

    const handleEnroll = () => {
        setIsPaymentModalOpen(true);
    };

    const processEnrollment = async (couponCode?: string) => {
        try {
            const result = await enrollUser(course.id, couponCode); // Pass couponCode
            
            if (result.success) {
                toast.success("Iscrizione completata con successo!");
                setIsPaymentModalOpen(false);
                router.refresh(); 
            } else {
                toast.error(result.message || "Errore durante l'iscrizione. Riprova.");
                console.error(result.error);
            }
          } catch (err) {
            console.error(err);
            toast.error("Errore imprevisto.");
          }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Course Header */}
        <div className="mb-8">
          <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Torna ai Corsi
          </Link>

          <div className="mt-4 flex flex-col lg:flex-row gap-8">
            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold tracking-tight mb-2">{course.title}</h1>
                  <p className="text-lg text-muted-foreground">{course.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 9.246 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{course.lessons.length} lezioni</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{hours > 0 ? `${hours}h ` : ''}{minutes}m totali</span>
                </div>
              </div>

              {isEnrolled && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Il tuo progresso</span>
                    <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>

            {/* Enrollment Card */}
            <Card className="lg:w-80 h-fit">
              <CardHeader>
                <div className="relative aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                {hasDiscount ? (
                    <div className="space-y-1">
                        <CardTitle className="text-2xl text-red-600">€{effectivePrice.toFixed(2)}</CardTitle>
                        <p className="text-sm text-muted-foreground line-through">€{course.price.toFixed(2)}</p>
                        {course.discountExpiresAt && (
                            <p className="text-xs text-red-500 font-medium">
                                Offerta termina il {new Date(course.discountExpiresAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ) : (
                    <CardTitle className="text-2xl">€{course.price}</CardTitle>
                )}
                <CardDescription>Acquisto una tantum, accesso a vita</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEnrolled ? (
                  <>
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      ✓ Iscritto
                    </Badge>
                    <Button asChild className="w-full" size="lg">
                      <Link href={course.lessons.length > 0 ? `/courses/${course.id}/lessons/${course.lessons[0].id}` : '#'}>
                        {progress > 0 ? 'Continua' : 'Inizia corso'}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEnroll} className="w-full" size="lg">
                    Iscriviti ora
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Course Content */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Contenuto del corso</h2>
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => {
              const isCompleted = completedSet.has(lesson.id);
              
              // Locked Logic:
              // 1. First lesson (index 0) is always unlocked.
              // 2. Lesson N is unlocked only if Lesson N-1 is completed.
              // 3. Must be enrolled.
              let isLocked = false;
              if (!isEnrolled) {
                   // If not enrolled, usually we assume locked or just "start course" takes to first. 
                   // But let's say purely based on sequence:
                   isLocked = true; 
              } else if (index > 0) {
                   const prevLessonId = course.lessons[index - 1].id;
                   if (!completedSet.has(prevLessonId)) {
                       isLocked = true;
                   }
              }

              // Special case: if not enrolled, we might show them as "locked" or just generic list.
              // Existing logic said `!isAccessible ? 'opacity-60'` where accessible was just `isEnrolled`.
              // We want strict sequentiality.
              
              // If not enrolled, let's keep everything "locked" except maybe preview? 
              // For now, let's stick to user request: "Lesson 2 locked if Lesson 1 not completed".
              
              const isAccessible = !isLocked;
              const lessonMinutes = Math.floor((lesson.videoDuration || 0) / 60);

              return (
                <Card key={lesson.id} className={!isAccessible ? 'opacity-50 grayscale-[0.5]' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon / Number */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isAccessible 
                             ? 'bg-primary/10 text-primary'
                             : 'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isLocked ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                             <h3 className="font-medium truncate">{lesson.title}</h3>
                             {isLocked && <Badge variant="outline" className="text-xs py-0 h-5">Bloccata</Badge>}
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground truncate mb-1">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{lessonMinutes} min</span>
                          {lesson.quizMarkersCount > 0 && (
                            <span>{lesson.quizMarkersCount} quiz</span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                          {isAccessible ? (
                            <Button asChild variant={isCompleted ? "ghost" : "default"} size="sm">
                              <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                                {isCompleted ? 'Rivedi' : 'Inizia'}
                              </Link>
                            </Button>
                          ) : (
                            <Button disabled variant="ghost" size="sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Bloccata
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onConfirm={processEnrollment}
            price={effectivePrice}
            courseTitle={course.title}
            courseId={course.id}
        />
    </div>
    );
}
