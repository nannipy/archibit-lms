import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CourseActions } from './course-actions';

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/courses');
  }

  const courses = await prisma.course.findMany({
    include: {
      lessons: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Courses</h1>
            <p className="text-muted-foreground text-lg">Manage your course catalog</p>
          </div>
          <Link
            href="/admin/courses/create"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
          >
            Create course
          </Link>
        </div>

        {/* Courses Table Container with Bento Style */}
        <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Lessons
                  </th>
                  <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-8 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div>
                        <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          <Link href={`/admin/courses/${course.id}`}>{course.title}</Link>
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">{course.description}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                         <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-mono">{course.lessons.length}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-foreground">
                      {course._count.enrollments}
                    </td>
                    <td className="px-8 py-5 text-sm font-mono text-foreground font-medium">
                      €{course.price.toFixed(2)}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        course.isPublished 
                          ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                          : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right text-sm">
                      <CourseActions courseId={course.id} isPublished={course.isPublished} />
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-8 py-12 text-center text-muted-foreground">
                        No courses found. Start by creating one.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
