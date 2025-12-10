'use client';

import { Button } from '@/components/ui/button';

interface CertificateDownloadButtonProps {
    courseTitle: string;
    userName: string;
    issuedAt: Date | string;
}

export function CertificateDownloadButton({ courseTitle, userName, issuedAt }: CertificateDownloadButtonProps) {
    
    const handleDownload = async () => {
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
        doc.text(courseTitle, 148, 150, { align: "center" });

        doc.setFontSize(15);
        const dateStr = typeof issuedAt === 'string' ? new Date(issuedAt).toLocaleDateString('it-IT') : issuedAt.toLocaleDateString('it-IT');
        doc.text(`Data: ${dateStr}`, 148, 180, { align: "center" });

        doc.save(`${courseTitle.replace(/\s+/g, '_')}_Certificato.pdf`);
    };

    return (
        <Button onClick={handleDownload} className="w-full bg-primary hover:bg-primary/90">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Scarica PDF
        </Button>
    );
}
