
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { LessonForm } from '../../../lesson-form';
import { createLesson } from '../../../lesson-actions';

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CreateLessonPage(props: Props) {
  const params = await props.params;

  const {
    courseId
  } = params;

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== 'ADMIN') redirect('/courses');

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      _count: {
        select: { lessons: true }
      }
    }
  });

  if (!course) redirect('/admin/courses');

  // Pre-calculate next order
  const nextOrder = (course._count.lessons || 0) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center h-16">
              <h1 className="text-xl font-medium text-gray-900">Add Lesson to: {course.title}</h1>
           </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LessonForm 
            courseId={courseId}
            action={createLesson} 
            submitLabel="Create Lesson"
            initialData={{
                title: '',
                description: '',
                videoUrl: '',
                videoDuration: 0,
                order: nextOrder
            }}
        />
      </main>
    </div>
  );
}
