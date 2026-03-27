'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { useProgressStore } from '@/store/progressStore';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdf';
import { ZOOM_FIT_PADDING } from '@/lib/constants';

export function usePDF(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
) {
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

    // Render serialization
    const renderIdRef = useRef(0);
    const renderingRef = useRef(false);
    const pendingRenderRef = useRef<{ page: number; scale: number } | null>(null);
    const cancelRef = useRef<(() => void) | null>(null);
    const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ── Load PDF document ────────────────────────────────────────────────
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
                const msg = err instanceof Error ? err.message : String(err);
                if (msg.includes('cancelled') || msg.includes('Rendering cancelled')) return;
                setError(msg || 'Failed to load PDF document');
            }
        };

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    // ── Calculate fit-to-width base scale ────────────────────────────────
    const calcBaseScale = useCallback(async () => {
        if (!pdfDoc || !containerRef.current) return;
        try {
            const page = await pdfDoc.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            // On mobile (<768px), scale to full viewport width; on desktop use container width minus padding
            const isMobile = window.innerWidth < 768;
            const containerWidth = isMobile
                ? window.innerWidth
                : containerRef.current.clientWidth - ZOOM_FIT_PADDING;
            const scale = containerWidth / viewport.width;
            setBaseScale(scale);
        } catch {
            // Silently fail
        }
    }, [pdfDoc, containerRef, setBaseScale]);

    // ── Debounced resize + orientation change ────────────────────────────
    useEffect(() => {
        calcBaseScale();

        const debouncedResize = () => {
            if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
            resizeTimerRef.current = setTimeout(() => {
                calcBaseScale();
            }, 150);
        };

        // ResizeObserver for the container
        let resizeObserver: ResizeObserver | null = null;
        if (containerRef.current) {
            resizeObserver = new ResizeObserver(debouncedResize);
            resizeObserver.observe(containerRef.current);
        }

        // Orientation change (mobile rotation)
        window.addEventListener('orientationchange', debouncedResize);
        // Fallback resize
        window.addEventListener('resize', debouncedResize);

        return () => {
            if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('orientationchange', debouncedResize);
            window.removeEventListener('resize', debouncedResize);
        };
    }, [calcBaseScale, containerRef]);

    // ── Serialized page renderer ─────────────────────────────────────────
    const executeRender = useCallback(
        async (page: number, scale: number) => {
            if (!pdfDoc || !canvasRef.current) return;

            const id = ++renderIdRef.current;

            // Cancel in-progress render
            if (renderingRef.current && cancelRef.current) {
                cancelRef.current();
                cancelRef.current = null;
            }

            if (renderingRef.current) {
                pendingRenderRef.current = { page, scale };
                return;
            }

            renderingRef.current = true;
            setRendering(true);

            try {
                const handle = await renderPageToCanvas(
                    pdfDoc, page, canvasRef.current!, scale,
                );

                if (id !== renderIdRef.current) {
                    handle.cancel();
                    return;
                }

                cancelRef.current = handle.cancel;
                await handle.promise;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                if (msg.includes('cancelled') || msg.includes('Rendering cancelled')) {
                    // Expected
                } else if (id === renderIdRef.current) {
                    setError(msg || 'Failed to render page');
                }
            } finally {
                renderingRef.current = false;
                cancelRef.current = null;

                if (id === renderIdRef.current) {
                    setRendering(false);
                }

                if (pendingRenderRef.current) {
                    const pending = pendingRenderRef.current;
                    pendingRenderRef.current = null;
                    executeRender(pending.page, pending.scale);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [pdfDoc, canvasRef],
    );

    // ── Trigger render on page/zoom/scale change ─────────────────────────
    useEffect(() => {
        if (!pdfDoc || baseScale === 0) return;
        const scale = baseScale * zoom;
        executeRender(currentPage, scale);

        return () => {
            if (cancelRef.current) {
                cancelRef.current();
                cancelRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfDoc, currentPage, zoom, baseScale]);

    // ── Save progress on page change ─────────────────────────────────────
    useEffect(() => {
        if (pdfDoc && fileName && currentPage) {
            saveProgress(fileName, currentPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, fileName]);

    return { calcBaseScale };
}
