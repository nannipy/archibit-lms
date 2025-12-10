'use client';

import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';

const studentNavItems = [
  { label: "Corsi", href: "/courses" },
  { label: "Certificati", href: "/certificates" },
];

export function StudentHeader() {
  const { user, signOut } = useAuth();
  
  // Optionally handle loading state if critical, but Navbar handles null user gracefully (shows login).
  // For student section, usually we are authed.
  
  return (
    <header className="relative z-50">
      {/* We add a spacer because Navbar is fixed/floating */}
      <div className="h-24 md:h-28" /> 
      <Navbar 
        items={studentNavItems}
        user={user}
        onLogout={signOut}
      />
    </header>
  );
}
