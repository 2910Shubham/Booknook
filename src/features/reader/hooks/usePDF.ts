'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { useProgressStore } from '@/store/progressStore';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdf';
import { ZOOM_FIT_PADDING } from '@/lib/constants';

export function usePDF(canvasRef: React.RefObject<HTMLCanvasElement | null>, containerRef: React.RefObject<HTMLDivElement | null>) {
    const file = usePdfStore((s) => s.file);
    const fileName = usePdfStore((s) => s.fileName);
    const pdfDoc = usePdfStore((s) => s.pdfDoc);
    const currentPage = usePdfStore((s) => s.currentPage);
    const zoom = usePdfStore((s) => s.zoom);
    const baseScale = usePdfStore((s) => s.baseScale);
    const setPdfDoc = usePdfStore((s) => s.setPdfDoc);
    const setLoading = usePdfStore((s) => s.setLoading);
    const setRendering = usePdfStore((s) => s.setRendering);
    const setError = usePdfStore((s) => s.setError);
    const setBaseScale = usePdfStore((s) => s.setBaseScale);
    const setCurrentPage = usePdfStore((s) => s.setCurrentPage);

    const saveProgress = useProgressStore((s) => s.saveProgress);
    const getProgress = useProgressStore((s) => s.getProgress);
    const addToast = useProgressStore((s) => s.addToast);

    const renderTaskRef = useRef<number>(0);

    // Load PDF document
    useEffect(() => {
        if (!file) return;

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const doc = await loadPdfDocument(file);
                if (cancelled) return;
                const numPages = doc.numPages;
                setPdfDoc(doc, numPages);

                // Restore progress
                const savedPage = getProgress(fileName);
                if (savedPage && savedPage > 1 && savedPage <= numPages) {
                    setCurrentPage(savedPage);
                    addToast(`Resumed from page ${savedPage}`, 'info');
                }
            } catch (err) {
                if (cancelled) return;
                setError(
                    err instanceof Error ? err.message : 'Failed to load PDF document',
                );
            }
        };

        load();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    // Calculate fit-to-width base scale
    const calcBaseScale = useCallback(async () => {
        if (!pdfDoc || !containerRef.current) return;
        try {
            const page = await pdfDoc.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            const containerWidth = containerRef.current.clientWidth - ZOOM_FIT_PADDING;
            const scale = containerWidth / viewport.width;
            setBaseScale(scale);
        } catch {
            // Silently fail — will use default scale
        }
    }, [pdfDoc, containerRef, setBaseScale]);

    useEffect(() => {
        calcBaseScale();

        const handleResize = () => calcBaseScale();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calcBaseScale]);

    // Render current page
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        const taskId = ++renderTaskRef.current;

        const render = async () => {
            setRendering(true);
            try {
                const scale = baseScale * zoom;
                await renderPageToCanvas(pdfDoc, currentPage, canvasRef.current!, scale);
            } catch (err) {
                if (taskId === renderTaskRef.current) {
                    setError(
                        err instanceof Error ? err.message : 'Failed to render page',
                    );
                }
            } finally {
                if (taskId === renderTaskRef.current) {
                    setRendering(false);
                }
            }
        };

        render();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfDoc, currentPage, zoom, baseScale]);

    // Save progress on page change
    useEffect(() => {
        if (pdfDoc && fileName && currentPage) {
            saveProgress(fileName, currentPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, fileName]);

    return { calcBaseScale };
}
