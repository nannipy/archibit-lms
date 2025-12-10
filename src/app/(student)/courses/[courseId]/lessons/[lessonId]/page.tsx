
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getViewingProgress } from '@/lib/services/progress';
import LessonClient from './LessonClient';
import { Suspense } from 'react';
import { LessonSkeleton } from '@/components/skeletons/LessonSkeleton';
import { QuizMarker } from '@/types';

interface LessonPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LessonPage(props: LessonPageProps) {
  const params = await props.params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: params.courseId,
      },
    },
  });

  if (!enrollment) {
    redirect(`/courses/${params.courseId}`);
  }

  // Fetch Course & Lessons
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
        lessons: {
            orderBy: { order: 'asc' },
            include: {
                quizMarkers: true
            }
        }
    }
  });

  if (!course) {
    notFound();
  }

  const lesson = course.lessons.find((l) => l.id === params.lessonId);

  if (!lesson) {
    notFound();
  }

  // Fetch ViewingLog
  const progress = await getViewingProgress(user.id, lesson.id);

  const maxViewedTime = progress ? progress.maxViewedTime : 0;
  const currentTime = progress ? progress.currentTime : 0;

  // Determine prev/next lessons
  const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
  const previousLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  
  // Serialize complex objects if needed, but Prisma objects are usually fine for Client Components
  // exception: Date objects. But here we mostly use primitives in the props we defined.
  // quizMarkers might have `options` as Json. We need to cast it.

  const safeLesson = {
      ...lesson,
      quizMarkers: lesson.quizMarkers.map(qm => ({
            id: qm.id,
            lessonId: qm.lessonId,
            timestamp: qm.timestamp,
            question: qm.question,
            options: qm.options as any 
      }))
  };

  // Fetch User Details to get name
  const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
  });

  // Check Sequential Locking
  const allLessonProgress = await prisma.lessonProgress.findMany({
      where: {
          userId: user.id,
          lessonId: { in: course.lessons.map(l => l.id) }
      }
  });

  const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id);
  
  // Rule: To access lesson N (index > 0), lesson N-1 must be completed.
  if (lessonIndex > 0) {
      const prevLessonId = course.lessons[lessonIndex - 1].id;
      const prevLessonProgress = allLessonProgress.find(p => p.lessonId === prevLessonId);
      
      if (!prevLessonProgress?.isCompleted) {
          // Locked! Redirect to the previous lesson (or first incomplete)
          redirect(`/courses/${params.courseId}/lessons/${prevLessonId}`);
      }
  }

  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonClient 
        userName={dbUser?.name || ''}
        isCourseCompleted={!!enrollment.completedAt}
        course={{
            id: course.id,
            title: course.title,
            lessons: course.lessons.map(l => ({
                id: l.id,
                title: l.title,
                description: l.description,
                videoUrl: l.videoUrl,
                videoDuration: l.videoDuration,
                order: l.order
            }))
        }}
        lesson={safeLesson}
        initialMaxViewedTime={maxViewedTime}
        initialCurrentTime={currentTime}
        previousLessonId={previousLesson?.id}
        previousLessonTitle={previousLesson?.title}
        nextLessonId={nextLesson?.id}
        nextLessonTitle={nextLesson?.title}
      />
    </Suspense>
  );
}
