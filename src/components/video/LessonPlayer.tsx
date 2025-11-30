'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SecureVideoPlayer from './SecureVideoPlayer';
import QuizModal from '../quiz/QuizModal';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { QuizMarker } from '@/types';

interface LessonPlayerProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string;
    duration: number;
  };
  course: {
    id: string;
    title: string;
  };
  quizMarkers: QuizMarker[];
  maxViewedTime: number;
  previousLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
}

export default function LessonPlayer({
  lesson,
  course,
  quizMarkers,
  maxViewedTime: initialMaxViewedTime,
  previousLesson,
  nextLesson,
}: LessonPlayerProps) {
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
  };

  const handleQuizComplete = (isCorrect: boolean, rewindTo?: number) => {
    setCurrentQuiz(null);
    
    if (!isCorrect && rewindTo !== undefined) {
      // Video player will handle rewind
      console.log(`Rewind to ${rewindTo}s`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link
              href={`/courses/${course.id}`}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {course.title}
            </Link>
            <Link href="/courses" className="text-sm text-gray-600 hover:text-gray-900">
              All courses
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-normal text-gray-900 mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-600">{lesson.description}</p>
          )}
        </div>

        {/* Video Player */}
        <div className="mb-8">
          <SecureVideoPlayer
            lessonId={lesson.id}
            videoUrl={lesson.videoUrl}
            duration={lesson.duration}
            maxViewedTime={maxViewedTime}
            quizMarkers={quizMarkers}
            onProgress={handleProgress}
            onQuizTrigger={handleQuizTrigger}
            onPlayStateChange={handlePlayStateChange}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          {previousLesson ? (
            <Link
              href={`/courses/${course.id}/lesson/${previousLesson.id}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="text-left">
                <div className="text-xs text-gray-500">Previous</div>
                <div className="font-medium">{previousLesson.title}</div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link
              href={`/courses/${course.id}/lesson/${nextLesson.id}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <div className="text-right">
                <div className="text-xs text-gray-500">Next</div>
                <div className="font-medium">{nextLesson.title}</div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <Link
              href={`/courses/${course.id}`}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Complete course
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          )}
        </div>
      </main>

      {/* Quiz Modal */}
      {currentQuiz && (
        <QuizModal marker={currentQuiz} onComplete={handleQuizComplete} />
      )}
    </div>
  );
}
