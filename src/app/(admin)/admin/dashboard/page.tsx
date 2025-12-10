import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AdminCharts from './AdminCharts';

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

  // 1. Basic Stats
  const [
    totalCourses, 
    totalStudents, 
    activeStudents,
    totalEnrollments, 
    totalCertificates
  ] = await Promise.all([
    prisma.course.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ 
        where: { 
            role: 'STUDENT',
            enrollments: { some: {} }
        } 
    }),
    prisma.enrollment.count(),
    prisma.certificate.count(),
  ]);

  // 2. Recent Activity
  const recentEnrollments = await prisma.enrollment.findMany({
    take: 5,
    orderBy: { enrolledAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  const recentCertificates = await prisma.certificate.findMany({
    take: 5,
    orderBy: { issuedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  // 3. Chart Data (Last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1); // Start of month

  const chartEnrollments = await prisma.enrollment.findMany({
      where: { enrolledAt: { gte: sixMonthsAgo.toISOString() } },
      select: { enrolledAt: true }
  });
  
  const chartCertificates = await prisma.certificate.findMany({
      where: { issuedAt: { gte: sixMonthsAgo.toISOString() } },
      select: { issuedAt: true }
  });

  const getMonthKey = (date: Date | string) => {
      const d = new Date(date);
      return d.toLocaleString('en-US', { month: 'short' });
  };

  const months = [];
  for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      months.push(d.toLocaleString('en-US', { month: 'short' }));
  }

  const chartData = months.map(month => ({
      name: month,
      enrollments: chartEnrollments.filter(e => getMonthKey(e.enrolledAt) === month).length,
      certificates: chartCertificates.filter(c => getMonthKey(c.issuedAt) === month).length
  }));

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Platform overview and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-10">
          {[
             { label: 'Total Courses', value: totalCourses, color: 'text-blue-600', bg: 'bg-blue-500/10' },
             { label: 'Total Students', value: totalStudents, color: 'text-gray-600', bg: 'bg-gray-500/10' },
             { label: 'Active Learners', value: activeStudents, color: 'text-green-600', bg: 'bg-green-500/10' },
             { label: 'Enrollments', value: totalEnrollments, color: 'text-purple-600', bg: 'bg-purple-500/10' },
             { label: 'Certificates', value: totalCertificates, color: 'text-amber-600', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
             <div key={i} className="bg-card/50 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm p-4 hover:shadow-md transition-shadow">
               <div className="flex flex-col h-full justify-between gap-2">
                 <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-2`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                 </div>
               </div>
             </div>
          ))}
        </div>

        {/* Charts */}
        <AdminCharts data={chartData} />

        {/* Recent Activity Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Enrollments */}
            <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-border/10">
                    <h2 className="text-xl font-semibold text-foreground">Recent Enrollments</h2>
                </div>
                <div className="divide-y divide-border/20">
                    {recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="px-8 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-medium">
                            {enrollment.user.name?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{enrollment.user.name}</p>
                            <p className="text-sm text-muted-foreground">{enrollment.course.title}</p>
                        </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </div>
                    </div>
                    ))}
                    {recentEnrollments.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">No recent enrollments.</div>
                    )}
                </div>
            </div>

            {/* Recent Certificates */}
            <div className="bg-card/50 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-border/10">
                    <h2 className="text-xl font-semibold text-foreground">Recent Certificates</h2>
                </div>
                <div className="divide-y divide-border/20">
                    {recentCertificates.map((cert) => (
                    <div key={cert.id} className="px-8 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{cert.user.name}</p>
                            <p className="text-sm text-muted-foreground">{cert.course.title}</p>
                        </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                        {new Date(cert.issuedAt).toLocaleDateString()}
                        </div>
                    </div>
                    ))}
                     {recentCertificates.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">No certificates issued yet.</div>
                    )}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
