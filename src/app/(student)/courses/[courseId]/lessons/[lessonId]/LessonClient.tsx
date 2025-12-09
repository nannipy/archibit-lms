'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SecureVideoPlayer from '@/components/video/SecureVideoPlayer';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { QuizMarker } from '@/types';
import { Button } from '@/components/ui/button';
import QuizModal from '@/components/quiz/QuizModal';
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
  previousLessonId?: string;
  previousLessonTitle?: string;
  nextLessonId?: string;
  nextLessonTitle?: string;
}

export default function LessonClient({ 
    course, 
    lesson, 
    initialMaxViewedTime,
    previousLessonId,
    previousLessonTitle,
    nextLessonId,
    nextLessonTitle
}: LessonClientProps) {
  const router = useRouter();
  
  const [currentQuiz, setCurrentQuiz] = useState<QuizMarker | null>(null);
  const [maxViewedTime, setMaxViewedTime] = useState(initialMaxViewedTime);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoStateRef = useRef({
    currentTime: 0,
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

  const handleQuizTrigger = (marker: QuizMarker) => {
    setCurrentQuiz(marker);
    setIsPlaying(false); // Pause video
  };

  const handleQuizComplete = (isCorrect: boolean, rewindTo?: number) => {
    setCurrentQuiz(null);
    setIsPlaying(true); // Resume video
  };

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
            quizMarkers={lesson.quizMarkers}
            onProgress={handleProgress}
            onQuizTrigger={handleQuizTrigger}
            onPlayStateChange={handlePlayStateChange}
          />
        </div>

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
            <Button asChild>
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
            <Button asChild>
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
       {currentQuiz && (
        <QuizModal
          isOpen={!!currentQuiz}
          onClose={() => {}} 
          onComplete={handleQuizComplete}
          marker={currentQuiz}
        />
      )}
    </div>
  );
}
