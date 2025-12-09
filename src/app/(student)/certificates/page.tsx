
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Suspense } from 'react';
import { CoursesListSkeleton } from '@/components/skeletons/CoursesListSkeleton';

async function getCertificates(userId: string) {
    const certificates = await prisma.certificate.findMany({
        where: {
            userId: userId,
        },
        include: {
            course: {
                select: {
                    title: true,
                    thumbnailUrl: true
                }
            }
        },
        orderBy: {
            issuedAt: 'desc'
        }
    });

    return certificates;
}

async function CertificatesList({ userId }: { userId: string }) {
    const certificates = await getCertificates(userId);

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
                <Card key={cert.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Completato
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {cert.issuedAt.toLocaleDateString('it-IT', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <CardTitle className="line-clamp-2">{cert.course.title}</CardTitle>
                        <CardDescription>
                            Certificato ID: <span className="font-mono text-xs">{cert.id.slice(0, 8)}...</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="aspect-video relative bg-slate-100 rounded-md flex items-center justify-center mb-4 overflow-hidden border">
                            {cert.course.thumbnailUrl ? (
                                <Image
                                    src={cert.course.thumbnailUrl}
                                    alt={cert.course.title}
                                    fill
                                    className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-300"
                                />
                            ) : (
                                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                                </svg>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-16 h-16 text-primary/80 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant={cert.pdfUrl ? "default" : "secondary"} disabled={!cert.pdfUrl} asChild={!!cert.pdfUrl}>
                            {cert.pdfUrl ? (
                                <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Scarica PDF
                                </a>
                            ) : (
                                <span>Generazione in corso...</span>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            {certificates.length === 0 && (
                <Card className="col-span-full">
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 9.246 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Nessun certificato disponibile</h3>
                        <p className="text-muted-foreground mb-6">
                            Completa i corsi per ottenere i tuoi certificati.
                        </p>
                        <Button asChild>
                            <Link href="/courses">
                                Vai ai Corsi
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default async function CertificatesPage() {
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

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">I Miei Certificati</h1>
                    <p className="text-muted-foreground">
                        Visualizza e scarica i certificati dei corsi completati
                    </p>
                </div>

                <Suspense fallback={<CoursesListSkeleton />}>
                    <CertificatesList userId={user.id} />
                </Suspense>
            </main>
        </div>
    );
}
