import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { StudentHeader } from "@/components/layout/StudentHeader";
import { prisma } from "@/lib/prisma";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true } // Fetch minimal fields
    });
  }

  // Map to AuthUser type expected by StudentHeader/Navbar
  const mappedUser = dbUser ? {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role
  } : null;

  return (
    <>
      <StudentHeader initialUser={mappedUser} />
      {children}
    </>
  );
}
