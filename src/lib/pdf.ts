// ─── PDF.js Initialization ───────────────────────────────────────────────────
// This module is client-only. Import it only in 'use client' components.
import { PDFJS_WORKER_URL } from './constants';

// We lazy-load pdfjs-dist to avoid SSR issues (DOMMatrix not being available in Node.js)
let pdfjsModule: typeof import('pdfjs-dist') | null = null;

async function getPdfjs() {
    if (!pdfjsModule) {
        pdfjsModule = await import('pdfjs-dist');
        pdfjsModule.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    }
    return pdfjsModule;
}

// Re-export the type for use in stores/hooks
export type { PDFDocumentProxy } from 'pdfjs-dist';

export async function loadPdfDocument(data: ArrayBuffer) {
    const pdfjs = await getPdfjs();
    const loadingTask = pdfjs.getDocument({ data });
    return loadingTask.promise;
}

export async function renderPageToCanvas(
    pdfDoc: import('pdfjs-dist').PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale: number,
): Promise<{ width: number; height: number }> {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    const renderContext = {
        canvasContext: ctx,
        viewport,
        canvas,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render(renderContext as any).promise;

    return { width: viewport.width, height: viewport.height };
}
