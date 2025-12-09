import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';


export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero / Header Section in Bento Style */}
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          
          {/* Logo & Intro Card - Large Bento Item */}
          <div className="col-span-1 md:col-span-8 lg:col-span-8 bg-card/50 backdrop-blur-md rounded-[2rem] p-8 md:p-12 border border-white/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               {/* Abstract pattern or large icon could go here */}
               <div className="w-32 h-32 rounded-full bg-primary blur-3xl"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-start h-full justify-center">
              <div className="flex items-center gap-3 mb-6">
                 <Image src="/logo.png" alt="Archibit Logo" width={60} height={60} className="w-auto" />
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                Master the Art of <br/>
                <span className="text-primary italic font-serif">Architecture</span>
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                An advanced Learning Management System designed for precision, creativity, and secure certification.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                  <Link href="/login">Start Learning</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="rounded-full px-8 bg-white/50 hover:bg-white/80 border-0 text-foreground">
                  <Link href="/courses">Browse Catalog</Link>
                </Button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border/50 w-full flex items-center gap-2 text-sm text-muted-foreground/80">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">DEMO</span>
                <span>student@demo.com</span> • <span>password</span>
              </div>
            </div>
          </div>

          {/* Stat / Feature Card 1 - Video Security */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4 flex flex-col gap-4 md:gap-6">
             <div className="bg-card/50 backdrop-blur-sm rounded-[2rem] p-6 lg:p-8 border border-white/20 shadow-sm flex-1 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <div>
                   <h3 className="text-xl font-semibold mb-2">Secure Playback</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">
                     Heartbeat tracking and anti-skip technology ensures every second of learning is verified.
                   </p>
                </div>
             </div>

             <div className="bg-primary text-primary-foreground rounded-[2rem] p-6 lg:p-8 shadow-lg shadow-primary/20 flex-1 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="text-3xl font-bold mb-1">100%</h3>
                <p className="text-primary-foreground/90 font-medium">Completion Verified</p>
             </div>
          </div>

          {/* Interactive Quizzes - Wide */}
          <div className="col-span-1 md:col-span-6 bg-card/30 backdrop-blur-sm rounded-[2rem] p-8 border border-white/20 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:bg-card/40 transition-colors">
             <div className="flex-1 space-y-4">
               <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               </div>
               <h3 className="text-xl font-semibold">Interactive Quizzes</h3>
               <p className="text-muted-foreground">
                 Smart markers automatically rewind to relevant lessons when you miss a question.
               </p>
             </div>
             {/* Abstract visual representation of quiz */}
             <div className="w-full md:w-1/3 bg-background/50 rounded-xl p-4 border border-border/50">
               <div className="flex gap-2 mb-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="space-y-2">
                 <div className="h-2 w-3/4 bg-foreground/10 rounded-full"></div>
                 <div className="h-2 w-1/2 bg-foreground/10 rounded-full"></div>
               </div>
             </div>
          </div>

          {/* Certificates - Wide */}
          <div className="col-span-1 md:col-span-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2rem] p-8 border border-white/20 shadow-sm md:shadow-md hover:scale-[1.01] transition-transform duration-300">
             <div className="flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">Certified Excellence</h3>
                    <p className="text-sm text-muted-foreground">Official archibit documentation</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-background/50 rounded-xl border border-dashed border-border flex items-center gap-3">
                   <div className="w-8 h-10 border border-border bg-white shadow-sm flex items-center justify-center text-[10px] text-muted-foreground">PDF</div>
                   <div className="flex-1">
                      <div className="h-2 w-24 bg-foreground/10 rounded-full mb-1"></div>
                      <div className="h-2 w-16 bg-primary/20 rounded-full"></div>
                   </div>
                   <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary hover:text-primary-foreground">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                   </Button>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
