import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { LessonForm } from '../../../lesson-form';
import { updateLesson, deleteLesson } from '../../../lesson-actions';

interface Props {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function EditLessonPage(props: Props) {
  const params = await props.params;

  const {
    courseId,
    lessonId
  } = params;
  
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== 'ADMIN') redirect('/courses');

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
        quizMarkers: {
            orderBy: { timestamp: 'asc' }
        }
    }
  });

  if (!lesson || lesson.courseId !== courseId) redirect(`/admin/courses/${courseId}`);

  // Wrapper for update action to bind arguments
  const updateAction = updateLesson.bind(null, lessonId, courseId);
  const deleteAction = deleteLesson.bind(null, lessonId, courseId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center h-16">
              <h1 className="text-xl font-medium text-gray-900">Edit Lesson</h1>
           </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LessonForm 
            courseId={courseId}
            action={updateAction} 
            submitLabel="Save Changes"
            initialData={{
              ...lesson,
              quizMarkers: lesson.quizMarkers.map(marker => ({
                ...marker,
                options: marker.options as any
              }))
            }}
            showDelete={true}
            deleteAction={deleteAction}
        />
      </main>
    </div>
  );
}
