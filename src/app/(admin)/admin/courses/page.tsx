import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CourseActions } from './course-actions';

export default async function AdminCoursesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

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

  const [courses, totalCount] = await prisma.$transaction([
    prisma.course.findMany({
      take: pageSize,
      skip: skip,
      include: {
        lessons: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.course.count(),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

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
        <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="overflow-x-auto flex-grow">
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

          {/* Pagination Controls */}
          <div className="border-t border-white/10 px-8 py-4 flex items-center justify-between bg-white/5">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{courses.length > 0 ? skip + 1 : 0}</span> to <span className="font-medium">{Math.min(skip + pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <Link
                href={`/admin/courses?page=${page - 1}`}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !hasPrevPage
                    ? 'pointer-events-none opacity-50 cursor-not-allowed bg-secondary/50 text-muted-foreground'
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }`}
                aria-disabled={!hasPrevPage}
                tabIndex={!hasPrevPage ? -1 : undefined}
              >
                Previous
              </Link>
              <Link
                href={`/admin/courses?page=${page + 1}`}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !hasNextPage
                    ? 'pointer-events-none opacity-50 cursor-not-allowed bg-secondary/50 text-muted-foreground'
                    : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                }`}
                aria-disabled={!hasNextPage}
                tabIndex={!hasNextPage ? -1 : undefined}
              >
                Next
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
