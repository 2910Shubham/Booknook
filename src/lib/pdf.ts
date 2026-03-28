// ─── PDF.js Initialization ───────────────────────────────────────────────────
// This module is client-only. Import it only in 'use client' components.
import { PDFJS_WORKER_URL } from './constants';

// We lazy-load pdfjs-dist to avoid SSR issues (DOMMatrix not available in Node.js)
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
    // IMPORTANT: Copy the ArrayBuffer before passing to PDF.js.
    // PDF.js transfers the buffer to its Web Worker via postMessage,
    // which detaches the original. If React strict mode re-runs the
    // effect, the original ArrayBuffer would be unusable.
    const copy = data.slice(0);
    const loadingTask = pdfjs.getDocument({ data: copy });
    return loadingTask.promise;
}

export async function renderPageToCanvas(
    pdfDoc: import('pdfjs-dist').PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale: number,
) {
    const page = await pdfDoc.getPage(pageNum);
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const viewport = page.getViewport({ scale: scale * dpr });

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.style.width = `${viewport.width / dpr}px`;
    canvas.style.height = `${viewport.height / dpr}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    const renderContext = {
        canvasContext: ctx,
        viewport,
        canvas,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderTask = page.render(renderContext as any);

    return {
        promise: renderTask.promise.then(() => ({
            width: viewport.width,
            height: viewport.height,
        })),
        cancel: () => renderTask.cancel(),
    };
}
