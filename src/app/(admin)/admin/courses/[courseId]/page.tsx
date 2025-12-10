import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CourseForm } from '../course-form';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function EditCoursePage(props: Props) {
  const params = await props.params;

  const {
    courseId
  } = params;
  
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: authUser.id }, // Correctly use ID
  });

  if (!user || user.role !== 'ADMIN') redirect('/courses');

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
        lessons: {
            orderBy: { order: 'asc' }
        }
    }
  });

  if (!course) redirect('/admin/courses');

  async function updateCourse(formData: FormData) {
    'use server';
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const isPublished = formData.get('isPublished') === 'on';

    const discountPriceStr = formData.get('discountPrice') as string;
    const discountPrice = discountPriceStr ? parseFloat(discountPriceStr) : null;

    const discountExpiresAtStr = formData.get('discountExpiresAt') as string;
    const discountExpiresAt = discountExpiresAtStr ? new Date(discountExpiresAtStr) : null;

    await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        price,
        discountPrice,
        discountExpiresAt,
        thumbnailUrl,
        isPublished,
      },
    });

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Course Details</h2>
            <CourseForm 
                initialData={{
                    ...course,
                    thumbnailUrl: course.thumbnailUrl || undefined
                }} 
                action={updateCourse} 
                submitLabel="Save Changes" 
            />
        </section>

        <section>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Lessons</h2>
                <Link
                    href={`/admin/courses/${courseId}/lessons/create`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                >
                    Add Lesson
                </Link>
             </div>
             
             <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {course.lessons.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                        No lessons yet.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {course.lessons.map((lesson) => (
                            <li key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-900">{lesson.order}. {lesson.title}</p>
                                    <p className="text-sm text-gray-500">{Math.floor(lesson.videoDuration / 60)}m {lesson.videoDuration % 60}s</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link 
                                        href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
                                        className="text-gray-400 hover:text-blue-600 p-2"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
             </div>
        </section>
      </main>
    </div>
  );
}
