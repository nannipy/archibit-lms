import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { 
  Award, 
  Building2,
  CheckCircle2, 
  GraduationCap, 
  MonitorPlay,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default async function Home() {
  // Fetch top 3 featured courses
  const featuredCourses = await prisma.course.findMany({
    take: 3,
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { lessons: true } }
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      
      <div className="container mx-auto max-w-7xl space-y-6">
        
        {/* --- BENTO GRID SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* 1. HERO CARD (Large) */}
          <div className="col-span-1 md:col-span-8 bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm flex flex-col justify-center min-h-[400px]">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 max-w-2xl">              
               <div className="mb-6">
                 <Image src="/logo.png" alt="ArchiBit Logo" width={200} height={100} className="h-26 w-auto object-contain" />
              </div>
              
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Piattaforma professionale per la formazione continua di Architetti e Ingegneri.
                Corsi BIM, Autodesk certificati e rilascio di <strong>Crediti Formativi Professionali (CFP)</strong>.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link href="/courses">Catalogo Corsi</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8 bg-background">
                  <Link href="/login">Accedi / Registrati</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* 2. STATS & CERTIFICATIONS (Side Column) */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
             
             {/* Stat Card 1 */}
             <div className="flex-1 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-center items-start hover:shadow-md transition-shadow">
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                   <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Ente Certificato</h3>
                <p className="text-sm text-muted-foreground">
                  Centro autorizzato Autodesk (ATC), Certiport, Pearson VUE e Cepas.
                </p>
             </div>

             {/* Stat Card 2 */}
             <div className="flex-1 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-center items-start hover:shadow-md transition-shadow">
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                   <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Rilascio CFP</h3>
                <p className="text-sm text-muted-foreground">
                  Corsi accreditati presso il CNAPPC per la formazione obbligatoria.
                </p>
             </div>
          </div>

          {/* 3. WIDE BENEFIT CARD */}
          <div className="col-span-1 md:col-span-12 bg-muted/30 border border-border rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
             <div className="flex-1 space-y-4">
                <h2 className="text-2xl font-bold">Perché formarsi con noi?</h2>
                <ul className="space-y-3">
                   <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>Oltre 25 anni di esperienza nella formazione tecnica</span>
                   </li>
                   <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>Istruttori certificati e professionisti del settore</span>
                   </li>
                   <li className="flex items-center gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>Modalità e-learning flessibile 24/7</span>
                   </li>
                </ul>
             </div>
             
             {/* Visual representation of logos/software */}
             <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Placeholders for logos (Autodesk, Revit, etc) */}
                <div className="h-16 w-32 bg-card rounded-xl border border-border flex items-center justify-center font-bold text-lg text-muted-foreground">
                   Autodesk
                </div>
                <div className="h-16 w-32 bg-card rounded-xl border border-border flex items-center justify-center font-bold text-lg text-muted-foreground">
                   Revit
                </div>
                <div className="h-16 w-32 bg-card rounded-xl border border-border flex items-center justify-center font-bold text-lg text-muted-foreground">
                   CNAPPC
                </div>
             </div>
          </div>

        </div>

        {/* --- FEATURED COURSES SECTION --- */}
        <div className="pt-12">
           <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-3xl font-bold tracking-tight">Corsi in Evidenza</h2>
              <Link href="/courses" className="text-primary hover:underline flex items-center gap-2 font-medium">
                 Vedi tutti <ArrowRight className="w-4 h-4" />
              </Link>
           </div>

           <div className="grid md:grid-cols-3 gap-6">
              {featuredCourses.length > 0 ? (
                 featuredCourses.map((course) => (
                    <Link href={`/courses/${course.id}`} key={course.id} className="group">
                       <Card className="h-full hover:shadow-md transition-all duration-300 border-border overflow-hidden bg-card rounded-2xl">
                          <div className="relative aspect-video w-full bg-muted overflow-hidden">
                             {course.thumbnailUrl ? (
                                <Image 
                                  src={course.thumbnailUrl} 
                                  alt={course.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                             ) : (
                                <div className="flex h-full items-center justify-center bg-secondary/30">
                                   <Building2 className="w-12 h-12 text-muted-foreground/20" />
                                </div>
                             )}
                          </div>
                          <CardHeader className="p-5">
                             <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="font-medium">
                                   €{course.price}
                                </Badge>
                                {(course as any).category && ( // Assuming category might exist or future proofing
                                   <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                     { (course as any).category }
                                   </span>
                                )}
                             </div>
                             <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
                                {course.title}
                             </CardTitle>
                             <CardDescription className="line-clamp-2 mt-2">
                                {course.description}
                             </CardDescription>
                          </CardHeader>
                          <CardContent className="p-5 pt-0">
                             <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                                <div className="flex items-center gap-1.5">
                                   <MonitorPlay className="w-4 h-4" />
                                   {course._count.lessons} Lezioni
                                </div>
                                <div className="flex items-center gap-1.5">
                                   <Award className="w-4 h-4" />
                                   Certificato
                                </div>
                             </div>
                          </CardContent>
                       </Card>
                    </Link>
                 ))
              ) : (
                 <div className="col-span-full py-16 text-center text-muted-foreground bg-card/50 rounded-3xl border border-dashed border-border">
                    <Building2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nessun corso disponibile al momento.</p>
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}

