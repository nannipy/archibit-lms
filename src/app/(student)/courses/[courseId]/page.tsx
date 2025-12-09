
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CourseDetailClient } from './CourseDetailClient';
import { Suspense } from 'react';
import { CourseDetailSkeleton } from '@/components/skeletons/CourseDetailSkeleton';

export async function generateMetadata(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    select: { title: true, description: true }
  });

  if (!course) {
    return {
        title: 'Corso non trovato | Archibit LMS'
    }
  }

  return {
    title: `${course.title} | Archibit LMS`,
    description: course.description
  };
}

export default async function CourseDetailPage(props: { params: Promise<{ courseId: string }> }) {
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

  // Fetch Course
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      lessons: {
        select: {
          id: true,
          title: true,
          description: true,
          videoDuration: true,
          order: true,
          _count: {
             select: { quizMarkers: true }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Fetch Enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: params.courseId
      }
    }
  });

  // Fetch Completed Lessons (via ViewingLog)
  // We consider a lesson "completed" if it has a ViewingLog marked as completed or if user is enrolled (checking existing logic)
  // The existing client logic used a `completed = true` flag in ViewingLog.
  // schema says: isVisible, timestamp, maxViewedTime. It does NOT have a 'completed' boolean column explicitly in the schema provided earlier?
  // Checking schema again:
  // ViewingLog: id, userId, lessonId, currentTime, maxViewedTime, playbackRate, isVisible, timestamp.
  // Wait, I don't see `completed` boolean in `ViewingLog` in step 24 output.
  // But wait, in the previous `CourseDetailPage.tsx` (client version) lines 120-124 it selects `.eq('completed', true)`.
  // This implies the schema MIGHT have changed or I missed it.
  // Let's assume maxViewedTime >= videoDuration * 0.9 (90%) implies completion if column missing, OR check if column exists.
  // Actually, checking schema again in Step 24... No `completed` in `ViewingLog`.
  // However, `Enrollment.progress` exists.
  // Let's rely on Enrollment progress for now or fetch ViewingLogs and determine completion.
  // Users might have added 'completed' column later or the client code was assuming it.
  // I will fetch ViewingLogs and map completion based on presence.

  const viewingLogs = await prisma.viewingLog.findMany({
      where: {
          userId: user.id,
          lessonId: { in: course.lessons.map(l => l.id) }
      }
  });

  // Simple logic: if maxViewedTime > duration * 0.9 -> completed.
  const completedLessonIds = viewingLogs.filter(log => {
       const lesson = course.lessons.find(l => l.id === log.lessonId);
       if (!lesson) return false;
       return log.maxViewedTime >= (lesson.videoDuration || 0) * 0.9;
  }).map(l => l.lessonId);


  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
        <CourseDetailClient 
            course={{
                id: course.id,
                title: course.title,
                description: course.description,
                price: course.price,
                lessons: course.lessons.map(l => ({
                    id: l.id,
                    title: l.title,
                    description: l.description,
                    videoDuration: l.videoDuration,
                    quizMarkersCount: l._count.quizMarkers
                }))
            }}
            enrollment={enrollment ? {
                id: enrollment.id,
                progress: enrollment.progress,
                completedAt: enrollment.completedAt
            } : null}
            completedLessonIds={completedLessonIds}
        />
    </Suspense>
  );
}
