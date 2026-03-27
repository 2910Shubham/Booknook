import { create } from 'zustand';
import type { PDFDocumentProxy } from '@/lib/pdf';
import { ZOOM_DEFAULT, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '@/lib/constants';

interface PdfState {
    // File
    file: ArrayBuffer | null;
    fileName: string;
    fileSize: number;

    // PDF Document
    pdfDoc: PDFDocumentProxy | null;
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    isRendering: boolean;

    // Zoom
    zoom: number;
    baseScale: number; // fit-to-width scale

    // Actions — File
    setFile: (file: ArrayBuffer, name: string, size: number) => void;
    clearFile: () => void;

    // Actions — PDF
    setPdfDoc: (doc: PDFDocumentProxy, totalPages: number) => void;
    setCurrentPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
    setLoading: (loading: boolean) => void;
    setRendering: (rendering: boolean) => void;
    setError: (error: string | null) => void;

    // Actions — Zoom
    setZoom: (zoom: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    setBaseScale: (scale: number) => void;
}

export const usePdfStore = create<PdfState>((set, get) => ({
    file: null,
    fileName: '',
    fileSize: 0,
    pdfDoc: null,
    totalPages: 0,
    currentPage: 1,
    isLoading: false,
    error: null,
    isRendering: false,
    zoom: ZOOM_DEFAULT,
    baseScale: 0,

    setFile: (file, fileName, fileSize) =>
        set({ file, fileName, fileSize, error: null }),

    clearFile: () =>
        set({
            file: null,
            fileName: '',
            fileSize: 0,
            pdfDoc: null,
            totalPages: 0,
            currentPage: 1,
            isLoading: false,
            error: null,
            isRendering: false,
            zoom: ZOOM_DEFAULT,
            baseScale: 0,
        }),

    setPdfDoc: (pdfDoc, totalPages) =>
        set({ pdfDoc, totalPages, isLoading: false, error: null }),

    setCurrentPage: (page) => {
        const { totalPages } = get();
        if (page >= 1 && page <= totalPages) {
            set({ currentPage: page });
        }
    },

    nextPage: () => {
        const { currentPage, totalPages } = get();
        if (currentPage < totalPages) {
            set({ currentPage: currentPage + 1 });
        }
    },

    prevPage: () => {
        const { currentPage } = get();
        if (currentPage > 1) {
            set({ currentPage: currentPage - 1 });
        }
    },

    goToPage: (page) => {
        const { totalPages } = get();
        const clamped = Math.max(1, Math.min(page, totalPages));
        set({ currentPage: clamped });
    },

    setLoading: (isLoading) => set({ isLoading }),
    setRendering: (isRendering) => set({ isRendering }),
    setError: (error) => set({ error, isLoading: false }),

    setZoom: (zoom) => {
        const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
        set({ zoom: Math.round(clamped * 100) / 100 });
    },

    zoomIn: () => {
        const { zoom } = get();
        const next = Math.min(ZOOM_MAX, zoom + ZOOM_STEP);
        set({ zoom: Math.round(next * 100) / 100 });
    },

    zoomOut: () => {
        const { zoom } = get();
        const next = Math.max(ZOOM_MIN, zoom - ZOOM_STEP);
        set({ zoom: Math.round(next * 100) / 100 });
    },

    resetZoom: () => set({ zoom: ZOOM_DEFAULT }),

    setBaseScale: (baseScale) => set({ baseScale }),
}));
