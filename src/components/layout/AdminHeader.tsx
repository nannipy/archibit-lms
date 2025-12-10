'use client';

import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  user: {
    name: string | null;
    email: string;
    role?: 'STUDENT' | 'ADMIN';
  };
}

const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Courses", href: "/admin/courses" },
];

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="relative z-50">
       {/* Spacer for fixed navbar */}
      <div className="h-24 md:h-28" />
      <Navbar 
        items={adminNavItems} 
        user={user} 
        onLogout={handleLogout}
      />
    </header>
  );
}
