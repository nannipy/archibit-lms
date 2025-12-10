
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CoursesClient, CourseWithProgress } from './CoursesClient';
import { Suspense } from 'react';
import { CoursesListSkeleton } from '@/components/skeletons/CoursesListSkeleton';

export const metadata = {
  title: 'Catalogo Corsi | Archibit LMS',
  description: 'Sfoglia i nostri corsi online e inizia ad imparare oggi stesso.',
};

async function getCourses(userId: string) {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      _count: {
        select: { lessons: true },
      },
      enrollments: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
          progress: true,
          completedAt: true,
        },
      },
      lessons: {
        select: { id: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return courses.map(course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    discountPrice: course.discountPrice,
    discountExpiresAt: course.discountExpiresAt,
    thumbnailUrl: course.thumbnailUrl,
    _count: course._count,
    progress: course.enrollments[0]?.progress || 0,
    completedAt: course.enrollments[0]?.completedAt || null,
    isEnrolled: course.enrollments.length > 0,
    lessonsCount: course.lessons.length // Map for compatibility if needed
  })) as CourseWithProgress[];
}

export default async function CoursesPage() {
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

  const courses = await getCourses(user.id);

  // Fetch user details for name
  const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
  });

  return (
    <Suspense fallback={<CoursesListSkeleton />}>
        <CoursesClient 
            courses={courses} 
            userId={user.id} 
            userName={dbUser?.name || ''}
        />
    </Suspense>
  );
}
