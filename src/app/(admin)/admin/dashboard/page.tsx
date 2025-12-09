import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function AdminDashboard() {
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

  const stats = await Promise.all([
    prisma.course.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.enrollment.count(),
    prisma.certificate.count(),
  ]);

  const [totalCourses, totalStudents, totalEnrollments, totalCertificates] = stats;

  const recentEnrollments = await prisma.enrollment.findMany({
    take: 5,
    orderBy: { enrolledAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Platform overview and recent activity</p>
        </div>

        {/* Stats Grid - Bento Style */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full justify-between gap-4">
               <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
               </div>
               <div>
                 <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Courses</h3>
                 <p className="text-4xl font-bold text-foreground tracking-tight">{totalCourses}</p>
               </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full justify-between gap-4">
               <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               </div>
               <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Students</h3>
                  <p className="text-4xl font-bold text-foreground tracking-tight">{totalStudents}</p>
               </div>
            </div>
          </div>

          <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm p-6 hover:shadow-md transition-shadow">
             <div className="flex flex-col h-full justify-between gap-4">
               <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
               </div>
               <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Enrollments</h3>
                  <p className="text-4xl font-bold text-foreground tracking-tight">{totalEnrollments}</p>
               </div>
             </div>
          </div>

          <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full justify-between gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
               </div>
               <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Certificates Issued</h3>
                  <p className="text-4xl font-bold text-foreground tracking-tight">{totalCertificates}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-border/10">
            <h2 className="text-xl font-semibold text-foreground">Recent Enrollments</h2>
          </div>
          <div className="divide-y divide-border/20">
            {recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="px-8 py-5 flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium">
                     {enrollment.user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">{enrollment.user.name}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.course.title}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground font-mono bg-secondary/50 px-3 py-1 rounded-full">
                  {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
            {recentEnrollments.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No recent enrollments found.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

