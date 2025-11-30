import { jsPDF } from 'jspdf';

interface CertificateData {
    userName: string;
    courseName: string;
    completionDate: Date;
    certificateId: string;
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    // Background color
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(0, 65, 106);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    // Title
    doc.setFontSize(48);
    doc.setTextColor(0, 65, 106);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });

    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', 148.5, 70, { align: 'center' });

    // Student Name
    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(data.userName, 148.5, 90, { align: 'center' });

    // Course completion text
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the course', 148.5, 110, { align: 'center' });

    // Course Name
    doc.setFontSize(24);
    doc.setTextColor(0, 65, 106);
    doc.setFont('helvetica', 'bold');
    doc.text(data.courseName, 148.5, 130, { align: 'center' });

    // Date
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const dateStr = data.completionDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    doc.text(`Date: ${dateStr}`, 148.5, 150, { align: 'center' });

    // Certificate ID
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Certificate ID: ${data.certificateId}`, 148.5, 185, { align: 'center' });

    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return pdfBuffer;
}
