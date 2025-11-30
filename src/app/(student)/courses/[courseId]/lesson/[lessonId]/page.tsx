import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import LessonPlayer from '@/components/video/LessonPlayer';

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

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

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      quizMarkers: true,
      course: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!lesson || lesson.courseId !== params.courseId) {
    notFound();
  }

  // Get max viewed time for this lesson
  const maxLog = await prisma.viewingLog.findFirst({
    where: {
      userId: user.id,
      lessonId: lesson.id,
    },
    orderBy: {
      maxViewedTime: 'desc',
    },
  });

  const maxViewedTime = maxLog?.maxViewedTime || 0;

  // Find current lesson index
  const currentIndex = lesson.course.lessons.findIndex((l) => l.id === lesson.id);
  const previousLesson = currentIndex > 0 ? lesson.course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lesson.course.lessons.length - 1 ? lesson.course.lessons[currentIndex + 1] : null;

  return (
    <LessonPlayer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.videoDuration,
      }}
      course={{
        id: lesson.course.id,
        title: lesson.course.title,
      }}
      quizMarkers={lesson.quizMarkers.map((qm) => ({
        id: qm.id,
        lessonId: qm.lessonId,
        timestamp: qm.timestamp,
        question: qm.question,
        options: qm.options as { text: string; isCorrect: boolean }[],
      }))}
      maxViewedTime={maxViewedTime}
      previousLesson={previousLesson ? { id: previousLesson.id, title: previousLesson.title } : null}
      nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
    />
  );
}
