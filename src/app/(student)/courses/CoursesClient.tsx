'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { enrollUser } from '@/actions/enroll';
import { toast } from 'sonner'; 

export type CourseWithProgress = {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string | null;
  _count?: {
     lessons: number;
  };
  progress?: number | null;
  isEnrolled: boolean;
};

interface CoursesClientProps {
  courses: CourseWithProgress[];
  userId: string;
}

export function CoursesClient({ courses, userId }: CoursesClientProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<CourseWithProgress | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleEnrollClick = (course: CourseWithProgress) => {
    setSelectedCourse(course);
    setIsPaymentModalOpen(true);
  };

  const processEnrollment = async () => {
    if (!selectedCourse) return;

    try {
      const result = await enrollUser(selectedCourse.id);
      
      if (result.success) {
          toast.success("Iscrizione completata con successo!");
          setIsPaymentModalOpen(false);
          router.refresh(); 
      } else {
          toast.error("Errore durante l'iscrizione. Riprova.");
          console.error(result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("Errore imprevisto.");
    }
  };

  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const availableCourses = courses.filter(c => !c.isEnrolled);

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Catalogo Corsi</h1>
          <p className="text-muted-foreground">
            Sfoglia e iscriviti ai corsi per iniziare il tuo percorso di apprendimento
          </p>
        </div>

        {/* Enrolled Courses Section */}
        {enrolledCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">I Miei Corsi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(course => (
                  <Card key={course.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">Iscritto</Badge>
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
                          <span className="font-medium">{Math.round(course.progress || 0)}%</span>
                        </div>
                        <Progress value={course.progress || 0} />
                        <p className="text-xs text-muted-foreground">
                          {course._count?.lessons || 0} lezioni
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/courses/${course.id}`}>
                          Continua ad imparare
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
            {availableCourses.map(course => (
                <Card key={course.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">Disponibile</Badge>
                      <span className="text-sm font-semibold text-primary">
                        €{course.price}
                      </span>
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
              ))}
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

        {selectedCourse && (
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={processEnrollment}
                price={selectedCourse.price}
                courseTitle={selectedCourse.title}
            />
        )}
    </div>
  );
}
