'use client';

export async function compressPdfFile(file: File): Promise<File> {
    const buffer = await file.arrayBuffer();
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    return new File([pdfBytes], file.name, {
        type: 'application/pdf',
        lastModified: file.lastModified,
    });
}
