import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CourseForm } from '../course-form';
import { revalidatePath } from 'next/cache';

export default async function CreateCoursePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== 'ADMIN') redirect('/courses');

  async function createCourse(formData: FormData) {
    'use server';
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const isPublished = formData.get('isPublished') === 'on';

    await prisma.course.create({
      data: {
        title,
        description,
        price,
        thumbnailUrl,
        isPublished,
      },
    });

    revalidatePath('/admin/courses');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header handled by layout theoretically, but mimicking structure for now if needed or reusing layout */}
       <header className="bg-background border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center h-16">
              <h1 className="text-xl font-medium text-gray-900">Create Course</h1>
           </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseForm action={createCourse} submitLabel="Create Course" />
      </main>
    </div>
  );
}
