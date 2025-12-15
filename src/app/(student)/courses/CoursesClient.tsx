'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PaymentModal } from '@/components/payment/PaymentModal';
import Image from 'next/image';
import { enrollUser } from '@/actions/enroll';
import { toast } from 'sonner'; 

export type CourseWithProgress = {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  discountExpiresAt?: Date | string | null;
  thumbnailUrl?: string | null;
  _count?: {
     lessons: number;
  };
  progress?: number | null;
  completedAt?: Date | string | null;
  isEnrolled: boolean;
};

interface CoursesClientProps {
  courses: CourseWithProgress[];
  userId: string;
  userName: string;
}

export function CoursesClient({ courses, userId, userName }: CoursesClientProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleEnrollClick = (course: CourseWithProgress) => {
    setSelectedCourse(course);
    setIsPaymentModalOpen(true);
  };

  const processEnrollment = async (couponCode?: string) => {
    if (!selectedCourse) return;

    try {
      const result = await enrollUser(selectedCourse.id, couponCode);
      
      if (result.success) {
          toast.success("Iscrizione completata con successo!");
          setIsPaymentModalOpen(false);
          router.refresh(); 
      } else {
          toast.error(result.message || "Errore durante l'iscrizione. Riprova.");
          console.error(result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Errore imprevisto.");
    }
  };

  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const activeCourses = enrolledCourses.filter(c => !c.completedAt);
  const completedCourses = enrolledCourses.filter(c => c.completedAt);
  const availableCourses = courses.filter(c => !c.isEnrolled);

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Catalogo Corsi</h1>
          <p className="text-muted-foreground">
            Sfoglia e iscriviti ai corsi per iniziare il tuo percorso di apprendimento
          </p>
        </div>

        {/* Active Courses Section */}
        {activeCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">I Miei Corsi Attivi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map(course => (
                  <Card key={course.id} className="flex flex-col border-blue-100 dark:border-blue-900/50">
                    <CardHeader>
                      <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-md bg-muted">
                        {course.thumbnailUrl ? (
                          <Image
                            src={course.thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-secondary/20">
                            <svg className="h-12 w-12 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Corso</Badge>
                      </div>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium text-blue-600">{Math.round(course.progress || 0)}%</span>
                        </div>
                        <Progress value={course.progress || 0} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {course._count?.lessons || 0} lezioni
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course.id}`}>
                          Continua
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Available Courses Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            {enrolledCourses.length > 0 ? 'Altri Corsi' : 'Tutti i Corsi'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map(course => {
                const hasDiscount = course.discountPrice !== null && course.discountPrice !== undefined && 
                    (course.discountExpiresAt === null || course.discountExpiresAt === undefined || new Date(course.discountExpiresAt) > new Date());
                
                return (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-md bg-muted">
                        {course.thumbnailUrl ? (
                          <Image
                            src={course.thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-secondary/20">
                            <svg className="h-12 w-12 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">Disponibile</Badge>
                      <div className="text-right">
                          {hasDiscount ? (
                            <>
                                <span className="text-sm font-semibold text-red-600 block">
                                    €{course.discountPrice}
                                </span>
                                <span className="text-xs text-muted-foreground line-through block">
                                    €{course.price}
                                </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-primary">
                                €{course.price}
                            </span>
                          )}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 9.246 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>{course._count?.lessons || 0} lezioni</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/courses/${course.id}`}>Dettagli</Link>
                    </Button>
                    <Button className="flex-1" onClick={() => handleEnrollClick(course)}>
                      Iscriviti ora
                    </Button>
                  </CardFooter>
                </Card>
                );
              })}
          </div>
          
          {availableCourses.length === 0 && enrolledCourses.length > 0 && (
             <Card className="mt-6">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Sei iscritto a tutti i corsi disponibili! 🎉
                </p>
              </CardContent>
            </Card>
          )}

           {courses.length === 0 && (
             <Card className="mt-6">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nessun corso disponibile al momento.
                </p>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Completed Courses Section */}
        {completedCourses.length > 0 && (
          <div className="mb-12 border-t pt-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Corsi Completati</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map(course => (
                  <Card key={course.id} className="flex flex-col bg-gray-50 border-green-200">
                    <CardHeader>
                      <div className="relative aspect-video w-full mb-4 overflow-hidden rounded-md bg-muted">
                        {course.thumbnailUrl ? (
                          <Image
                            src={course.thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-secondary/20">
                            <svg className="h-12 w-12 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completato</Badge>
                        <span className="text-xs text-gray-500">
                            {course.completedAt ? new Date(course.completedAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2 text-gray-700">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="flex items-center gap-2 text-green-600 mb-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">100% Completato</span>
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button variant="outline" className="flex-1" asChild>
                            <Link href={`/courses/${course.id}`}>Rivedi Corso</Link>
                        </Button>
                        <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                            onClick={async () => {
                                const { jsPDF } = await import('jspdf');
                                const doc = new jsPDF({ orientation: 'landscape' });

                                doc.setFont("helvetica", "bold");
                                doc.setFontSize(40);
                                doc.text("Certificato di Completamento", 148, 60, { align: "center" });
                                
                                doc.setFontSize(20);
                                doc.setFont("helvetica", "normal");
                                doc.text("Si certifica che", 148, 90, { align: "center" });

                                doc.setFontSize(30);
                                doc.setFont("helvetica", "bold");
                                doc.text(userName, 148, 110, { align: "center" });

                                doc.setFontSize(20);
                                doc.setFont("helvetica", "normal");
                                doc.text("ha completato con successo il corso", 148, 130, { align: "center" });

                                doc.setFontSize(25);
                                doc.setFont("helvetica", "bold");
                                doc.text(course.title, 148, 150, { align: "center" });

                                doc.setFontSize(15);
                                doc.text(`Data: ${course.completedAt ? new Date(course.completedAt).toLocaleDateString('it-IT') : new Date().toLocaleDateString('it-IT')}`, 148, 180, { align: "center" });

                                doc.save(`${course.title.replace(/\s+/g, '_')}_Certificato.pdf`);
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Certificato
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {selectedCourse && (
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={processEnrollment}
                price={
                    selectedCourse.discountPrice !== null && selectedCourse.discountPrice !== undefined && 
                    (selectedCourse.discountExpiresAt === null || selectedCourse.discountExpiresAt === undefined || new Date(selectedCourse.discountExpiresAt) > new Date())
                    ? selectedCourse.discountPrice
                    : selectedCourse.price
                }
                courseTitle={selectedCourse.title}
                courseId={selectedCourse.id}
            />
        )}
    </div>
  );
}
