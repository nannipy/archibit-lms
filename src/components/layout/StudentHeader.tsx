'use client';

import { AuthUser, useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';

const studentNavItems = [
  { label: "Corsi", href: "/courses" },
  { label: "Certificati", href: "/certificates" },
];

interface StudentHeaderProps {
    initialUser?: AuthUser | null;
}

export function StudentHeader({ initialUser }: StudentHeaderProps) {
  const { user, signOut, loading } = useAuth();
  
  // Use client-side user if loaded, otherwise fallback to server-side initialUser
  // This handles the gap before client-side auth initializes
  const displayUser = loading ? initialUser : (user ?? initialUser);
  
  return (
    <header className="relative z-50">
      {/* We add a spacer because Navbar is fixed/floating */}
      <div className="h-24 md:h-28" /> 
      <Navbar 
        items={studentNavItems}
        user={displayUser}
        onLogout={signOut}
      />
    </header>
  );
}
