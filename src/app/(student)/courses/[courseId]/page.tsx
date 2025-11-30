import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
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

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          quizMarkers: true,
        },
      },
      enrollments: {
        where: { userId: user.id },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const isEnrolled = course.enrollments.length > 0;
  const enrollment = course.enrollments[0];

  // Get viewing logs for each lesson
  const viewingProgress = isEnrolled
    ? await Promise.all(
        course.lessons.map(async (lesson) => {
          const maxLog = await prisma.viewingLog.findFirst({
            where: {
              userId: user.id,
              lessonId: lesson.id,
            },
            orderBy: {
              maxViewedTime: 'desc',
            },
          });
          return {
            lessonId: lesson.id,
            maxViewedTime: maxLog?.maxViewedTime || 0,
            percentage: maxLog
              ? Math.min((maxLog.maxViewedTime / lesson.videoDuration) * 100, 100)
              : 0,
          };
        })
      )
    : [];

  const progressMap = new Map(viewingProgress.map((p) => [p.lessonId, p]));

  const totalDuration = course.lessons.reduce((sum, l) => sum + l.videoDuration, 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  const handleEnroll = async () => {
    'use server';
    // TODO: Implement payment flow
    // For now, create free enrollment
    await prisma.enrollment.create({
      data: {
        userId: user!.id,
        courseId: params.courseId,
      },
    });
    redirect(`/courses/${params.courseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/courses" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to courses
            </Link>
            <Link href="/" className="text-xl font-normal text-gray-900">
              ARCHIBIT LMS
            </Link>
            <span className="text-sm text-gray-700">{user.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-normal text-gray-900 mb-4">{course.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{course.description}</p>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {hours}h {minutes}m
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {course.lessons.length} lessons
            </span>
            {isEnrolled && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {Math.round(enrollment?.progress || 0)}% complete
              </span>
            )}
          </div>

          {!isEnrolled && (
            <div className="flex items-center gap-4">
              <span className="text-3xl font-semibold text-gray-900">
                €{course.price.toFixed(2)}
              </span>
              <form action={handleEnroll}>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-md transition-colors"
                >
                  Enroll now
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Lessons List */}
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          <div className="px-6 py-4 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Course Content</h2>
          </div>
          {course.lessons.map((lesson, index) => {
            const progress = progressMap.get(lesson.id);
            const duration = Math.floor(lesson.videoDuration / 60);
            const canAccess = isEnrolled;

            return (
              <div key={lesson.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        {lesson.title}
                      </h3>
                      {lesson.description && (
                        <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {duration} min
                        </span>
                        {lesson.quizMarkers.length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {lesson.quizMarkers.length} quiz{lesson.quizMarkers.length > 1 ? 'zes' : ''}
                          </span>
                        )}
                      </div>
                      {progress && progress.percentage > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{Math.round(progress.percentage)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    {canAccess ? (
                      <Link
                        href={`/courses/${course.id}/lesson/${lesson.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {progress && progress.percentage > 0 ? 'Continue' : 'Start'}
                      </Link>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
