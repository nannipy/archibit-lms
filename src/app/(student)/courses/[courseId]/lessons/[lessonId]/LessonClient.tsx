'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SecureVideoPlayer from '@/components/video/SecureVideoPlayer';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { QuizMarker } from '@/types';
import { Button } from '@/components/ui/button';
import { issueCertificate } from '@/actions/certificates';
import { completeLesson } from '@/actions/lessons';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { LessonSkeleton } from '@/components/skeletons/LessonSkeleton'; 

// Define types based on what we pass from Server Component
interface LessonClientProps {
  course: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      description: string | null;
      videoUrl: string;
      videoDuration: number;
      order: number;
    }[];
  };
  lesson: {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string;
    videoDuration: number;
    quizMarkers: QuizMarker[];
    order: number;
  };

  initialMaxViewedTime: number;
  initialCurrentTime: number;
  previousLessonId?: string;
  previousLessonTitle?: string;
  nextLessonId?: string;
  nextLessonTitle?: string;
  userName: string;
  isCourseCompleted: boolean;
}

export default function LessonClient({ 
    course, 
    lesson, 
    initialMaxViewedTime,
    initialCurrentTime,
    previousLessonId,
    previousLessonTitle,
    nextLessonId,
    nextLessonTitle,
    userName,
    isCourseCompleted
}: LessonClientProps) {
  const router = useRouter();
  
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizzesCompleted, setQuizzesCompleted] = useState(false);
  const [maxViewedTime, setMaxViewedTime] = useState(initialMaxViewedTime);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoStateRef = useRef({
    currentTime: initialCurrentTime,
    playbackRate: 1.0,
  });

  // Heartbeat hook
  useHeartbeat({
    lessonId: lesson.id,
    getCurrentTime: () => videoStateRef.current.currentTime,
    getMaxViewedTime: () => maxViewedTime,
    getPlaybackRate: () => videoStateRef.current.playbackRate,
    isPlaying,
    interval: 10000,
  });

  const handleProgress = (time: number) => {
    videoStateRef.current.currentTime = time;
    if (time > maxViewedTime) {
      setMaxViewedTime(time);
    }
  };

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const isVideoCompleted = maxViewedTime >= lesson.videoDuration * 0.99;

  const handleQuizAnswer = (isCorrect: boolean) => {
      if (isCorrect) {
          if (currentQuizIndex < lesson.quizMarkers.length - 1) {
              setCurrentQuizIndex(prev => prev + 1);
          } else {
              setQuizzesCompleted(true);
          }
      } else {
          // Ideally show feedback, for now just no-op or maybe shake effect (simple: alert)
          alert("Risposta errata, riprova.");
      }
  };

  // Effect to handle Lesson & Course Completion
  useEffect(() => {
      // Logic: Video + Quizzes Done
      const isLessonFinished = isVideoCompleted && (lesson.quizMarkers.length === 0 || quizzesCompleted);
      
      if (isLessonFinished) {
          // 1. Mark Lesson as Completed (Granular Progress)
          const markLessonComplete = async () => {
             await completeLesson(lesson.id);
             router.refresh(); // Refresh to update locks on server side
          };
          markLessonComplete();

          // 2. Check for Course Completion (Last Lesson)
          const isLastLesson = !nextLessonId;
          if (isLastLesson && !isCourseCompleted) {
              const completeCourse = async () => {
                  try {
                      const result = await issueCertificate(course.id);
                      if (result.success) {
                          toast.success("Corso completato! Certificato generato.");
                          router.refresh();
                      } else if (result.error !== 'Unauthorized') {
                       // Optional: Handle error silently or notify
                       console.error(result.error);
                  }
                  } catch (error) {
                      console.error("Failed to complete course:", error);
                  }
              };
              completeCourse();
          }
      }
  }, [isVideoCompleted, quizzesCompleted, nextLessonId, isCourseCompleted, course.id, lesson.quizMarkers.length, router, lesson.id]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={`/courses/${course.id}`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {course.title}
          </Link>
        </div>

        {/* Lesson Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}
        </div>

        {/* Video Player */}
        <div className="mb-8">
          <SecureVideoPlayer
            lessonId={lesson.id}
            videoUrl={lesson.videoUrl}
            duration={lesson.videoDuration}
            maxViewedTime={maxViewedTime}
            initialCurrentTime={initialCurrentTime}
            onProgress={handleProgress}
            onPlayStateChange={handlePlayStateChange}
          />
        </div>

        {/* Post-Video Quiz Section - Interactive Mode */}
        {!isCourseCompleted && isVideoCompleted && lesson.quizMarkers.length > 0 && !quizzesCompleted && (
             <div className="mb-8 p-6 bg-card border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">?</span>
                    Quiz di verifica
                </h3>
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(currentQuizIndex / lesson.quizMarkers.length) * 100}%` }}
                        />
                    </div>
                    
                    {/* Question */}
                    <div className="space-y-4">
                         <p className="text-lg font-medium">{lesson.quizMarkers[currentQuizIndex].question}</p>
                         <div className="grid gap-3">
                            {lesson.quizMarkers[currentQuizIndex].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuizAnswer(option.isCorrect)}
                                    className="text-left p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    {option.text}
                                </button>
                            ))}
                         </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">
                        Domanda {currentQuizIndex + 1} di {lesson.quizMarkers.length}
                    </p>
                </div>
             </div>
        )}

        {/* Quiz Review Mode (Course Completed) */}
        {isCourseCompleted && lesson.quizMarkers.length > 0 && (
             <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-green-900">
                        <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">✓</span>
                        Risultati Quiz
                    </h3>
                    <div className="text-right">
                         <span className="text-sm text-green-700 font-medium uppercase tracking-wider">Punteggio</span>
                         <div className="text-2xl font-bold text-green-700">100%</div>
                    </div>
                </div>

                <div className="space-y-8">
                    {lesson.quizMarkers.map((marker, idx) => (
                        <div key={marker.id} className="bg-white p-6 rounded-lg border border-green-100 shadow-sm">
                            <p className="text-lg font-medium mb-4 flex gap-2">
                                <span className="text-gray-400">{idx + 1}.</span> 
                                {marker.question}
                            </p>
                            <div className="grid gap-2 pl-6">
                                {marker.options.map((option, optIdx) => (
                                    <div 
                                        key={optIdx}
                                        className={`
                                            p-3 rounded-md border text-sm flex items-center gap-3
                                            ${option.isCorrect 
                                                ? "bg-green-50 border-green-200 text-green-800 font-medium" 
                                                : "bg-gray-50 border-gray-100 text-gray-500"}
                                        `}
                                    >
                                        <div className={`
                                            w-4 h-4 rounded-full border flex items-center justify-center
                                            ${option.isCorrect ? "border-green-500 bg-green-500" : "border-gray-300"}
                                        `}>
                                            {option.isCorrect && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        {option.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* Quiz Success Message (Just Completed, not full course complete yet) */}
        {!isCourseCompleted && quizzesCompleted && lesson.quizMarkers.length > 0 && (
            <div className="mb-8 p-4 bg-green-500/10 text-green-600 border border-green-500/20 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Quiz completati con successo! Puoi procedere.</span>
            </div>
        )}

        {/* Certificate Download Section (Only for Last Lesson) */}
        {!nextLessonId && isVideoCompleted && (lesson.quizMarkers.length === 0 || quizzesCompleted) && (
            <div className="mb-8 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulazioni!</h2>
                <p className="text-gray-600 mb-6">Hai completato il corso <strong>{course.title}</strong>.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                        onClick={async () => {
                            const { jsPDF } = await import('jspdf');
                            const doc = new jsPDF({
                                orientation: 'landscape',
                            });

                            // Simple Certificate Design
                            doc.setFont("helvetica", "bold");
                            doc.setFontSize(40);
                            doc.text("Certificato di Completamento", 148, 60, { align: "center" });
                            
                            doc.setFontSize(20);
                            doc.setFont("helvetica", "normal");
                            doc.text("Si certifica che", 148, 90, { align: "center" });

                            doc.setFontSize(30);
                            doc.setFont("helvetica", "bold");
                            doc.text(userName, 148, 110, { align: "center" });

                            doc.setFontSize(20);
                            doc.setFont("helvetica", "normal");
                            doc.text("ha completato con successo il corso", 148, 130, { align: "center" });

                            doc.setFontSize(25);
                            doc.setFont("helvetica", "bold");
                            doc.text(course.title, 148, 150, { align: "center" });

                            doc.setFontSize(15);
                            doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 148, 180, { align: "center" });

                            doc.save(`${course.title.replace(/\s+/g, '_')}_Certificato.pdf`);
                        }}
                        size="lg"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Scarica Certificato
                    </Button>
                </div>
                
                <div className="mt-8 text-left bg-white/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Prossimi passi:</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Controlla la dashboard per altri corsi.</li>
                        <li>Il certificato attesta il completamento del materiale didattico.</li>
                    </ul>
                </div>
            </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-6">
          {previousLessonId ? (
            <Button asChild variant="outline">
              <Link href={`/courses/${course.id}/lessons/${previousLessonId}`} className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Precedente</div>
                  <div className="font-medium">{previousLessonTitle}</div>
                </div>
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {nextLessonId ? (
            <Button 
                asChild 
                variant={(!isVideoCompleted || (lesson.quizMarkers.length > 0 && !quizzesCompleted)) ? "secondary" : "default"}
                className={(!isVideoCompleted || (lesson.quizMarkers.length > 0 && !quizzesCompleted)) ? "opacity-50 pointer-events-none" : ""}
            >
              <Link href={`/courses/${course.id}/lessons/${nextLessonId}`} className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs opacity-80">Successiva</div>
                  <div className="font-medium">{nextLessonTitle}</div>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          ) : (
            <Button 
              asChild 
              disabled={!isVideoCompleted || (lesson.quizMarkers.length > 0 && !quizzesCompleted)} 
              className={(!isVideoCompleted || (lesson.quizMarkers.length > 0 && !quizzesCompleted)) ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
            >
              <Link href={`/courses/${course.id}`} className="flex items-center gap-2">
                Completa corso
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </Button>
          )}
        </div>
      </main>

       {/* Quiz Modal */}

    </div>
  );
}
