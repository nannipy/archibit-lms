'use client';

import { useState, useRef } from 'react';
import SecureVideoPlayer from '@/components/video/SecureVideoPlayer';
import QuizModal from '@/components/quiz/QuizModal';
import { useHeartbeat } from '@/hooks/useHeartbeat';
import { QuizMarker } from '@/types';

// Example data - in production, this would come from the database
const exampleLesson = {
  id: 'lesson-123',
  title: 'Introduction to Next.js',
  videoUrl: 'video.mp4', // Replace with actual video
  duration: 600, // 10 minutes
  maxViewedTime: 0, // Will be fetched from DB
};

const exampleQuizMarkers: QuizMarker[] = [
  {
    id: 'quiz-1',
    lessonId: 'lesson-123',
    timestamp: 120, // 2 minutes into the video
    question: 'What is Next.js primarily used for?',
    options: [
      { text: 'Mobile app development', isCorrect: false },
      { text: 'React framework for web applications', isCorrect: true },
      { text: 'Database management', isCorrect: false },
      { text: 'Game development', isCorrect: false },
    ],
  },
  {
    id: 'quiz-2',
    lessonId: 'lesson-123',
    timestamp: 300, // 5 minutes into the video
    question: 'Which rendering method does Next.js support?',
    options: [
      { text: 'Only client-side rendering', isCorrect: false },
      { text: 'Only server-side rendering', isCorrect: false },
      { text: 'Both SSR and static generation', isCorrect: true },
      { text: 'None of the above', isCorrect: false },
    ],
  },
];

export default function LessonPage() {
  const [currentQuiz, setCurrentQuiz] = useState<QuizMarker | null>(null);
  const [maxViewedTime, setMaxViewedTime] = useState(exampleLesson.maxViewedTime);
  const videoRef = useRef<{ currentTime: number; playbackRate: number; playing: boolean }>({
    currentTime: 0,
    playbackRate: 1.0,
    playing: false,
  });

  // Heartbeat hook
  const { sendHeartbeat } = useHeartbeat({
    lessonId: exampleLesson.id,
    getCurrentTime: () => videoRef.current.currentTime,
    getMaxViewedTime: () => maxViewedTime,
    getPlaybackRate: () => videoRef.current.playbackRate,
    isPlaying: videoRef.current.playing,
    interval: 10000, // 10 seconds
  });

  const handleProgress = (time: number) => {
    videoRef.current.currentTime = time;
    if (time > maxViewedTime) {
      setMaxViewedTime(time);
    }
  };

  const handleQuizTrigger = (marker: QuizMarker) => {
    setCurrentQuiz(marker);
  };

  const handleQuizComplete = (isCorrect: boolean, rewindTo?: number) => {
    setCurrentQuiz(null);
    
    // TODO: In production, handle video player control
    // If incorrect, rewind video to rewindTo position
    if (!isCorrect && rewindTo !== undefined) {
      console.log(`Rewind video to ${rewindTo} seconds`);
      // videoElement.currentTime = rewindTo;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {exampleLesson.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-300">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {Math.floor(exampleLesson.duration / 60)} minutes
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {exampleQuizMarkers.length} Quiz Questions
            </span>
          </div>
        </div>

        {/* Video Player */}
        <SecureVideoPlayer
          lessonId={exampleLesson.id}
          videoUrl={exampleLesson.videoUrl}
          duration={exampleLesson.duration}
          maxViewedTime={maxViewedTime}
          quizMarkers={exampleQuizMarkers}
          onProgress={handleProgress}
          onQuizTrigger={handleQuizTrigger}
        />

        {/* Course Notes Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Lesson Notes</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              This lesson covers the fundamentals of Next.js, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>What is Next.js and why use it</li>
              <li>Server-side rendering vs static generation</li>
              <li>File-based routing</li>
              <li>API routes</li>
              <li>Image optimization</li>
            </ul>
          </div>
        </div>

        {/* Progress Info */}
        <div className="mt-6 bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-100">
              <p className="font-semibold mb-1">Video Tracking Active</p>
              <p className="text-blue-200">
                Your progress is being saved automatically. You can only skip to sections you've already watched. 
                Answer all quiz questions correctly to proceed and earn your certificate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {currentQuiz && (
        <QuizModal
          marker={currentQuiz}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}
