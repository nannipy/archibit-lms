import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  items?: NavItem[];
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  onLogout?: () => void;
}

export function Navbar({ 
  items = [
    { label: "Home", href: "/" },
    { label: "Corsi", href: "/courses" },
    { label: "Chi Siamo", href: "/about" },
  ],
  user,
  onLogout 
}: NavbarProps) {
  return (
    <nav className="fixed top-4 md:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* 
         Bento-style "Pill" Container 
         - Glassmorphism: backdrop-blur-md, bg-background/80
         - Pointer-events-auto ensures clicks work while nav container allows pass-through
      */}
      <div className="pointer-events-auto w-full max-w-5xl bg-background/80 backdrop-blur-md border border-white/20 shadow-lg shadow-black/5 rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:bg-background/90">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
           <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-18 h-18 overflow-hidden flex items-center justify-center transition-colors">
                 <img src="/logo.png" alt="Archibit" className="w-full h-full object-contain" />
              </div>
           </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
           {items.map((item) => (
             <Link 
               key={item.href} 
               href={item.href} 
               className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
             >
               {item.label}
             </Link>
           ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
           {/* Mobile Menu Trigger */}
           <Button variant="ghost" size="icon" className="md:hidden rounded-full hover:bg-primary/10 hover:text-primary">
              <Menu className="w-5 h-5" />
           </Button>

           {/* Desktop Actions */}
           <div className="hidden md:flex items-center gap-3">
             {user ? (
               <>
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 text-sm font-medium text-muted-foreground">
                   <User className="w-4 h-4" />
                   <span className="max-w-[150px] truncate">{user.name || user.email}</span>
                 </div>
                 {onLogout && (
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={onLogout}
                     className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                     title="Logout"
                   >
                     <LogOut className="w-4 h-4" />
                   </Button>
                 )}
               </>
             ) : (
               <>
                  <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                     <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform">
                     <Link href="/register">Get Started</Link>
                  </Button>
               </>
             )}
           </div>
        </div>

      </div>
    </nav>
  );
}
