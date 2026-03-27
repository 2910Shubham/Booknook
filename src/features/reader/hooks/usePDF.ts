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

    // Render serialization: only one render at a time
    const renderIdRef = useRef(0);
    const renderingRef = useRef(false);
    const pendingRenderRef = useRef<{
        page: number;
        scale: number;
    } | null>(null);
    const cancelRef = useRef<(() => void) | null>(null);

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
                // Ignore cancellation errors from PDF.js (strict mode / HMR)
                if (msg.includes('cancelled') || msg.includes('Rendering cancelled')) return;
                setError(msg || 'Failed to load PDF document');
            }
        };

        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);

    // ── Calculate fit-to-width base scale ────────────────────────────────
    const calcBaseScale = useCallback(async () => {
        if (!pdfDoc || !containerRef.current) return;
        try {
            const page = await pdfDoc.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            const containerWidth =
                containerRef.current.clientWidth - ZOOM_FIT_PADDING;
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

    // ── Serialized page renderer ─────────────────────────────────────────
    // This function ensures only one render runs at a time. If a render is
    // already in progress and a new one is requested, the in-progress one
    // is cancelled and the new one starts after cancellation completes.
    const executeRender = useCallback(
        async (page: number, scale: number) => {
            if (!pdfDoc || !canvasRef.current) return;

            const id = ++renderIdRef.current;

            // If a render is currently running, cancel it
            if (renderingRef.current && cancelRef.current) {
                cancelRef.current();
                cancelRef.current = null;
            }

            // If we're still mid-render (waiting for cancel to resolve),
            // store this as pending and return — it will be picked up
            // once the current render exits.
            if (renderingRef.current) {
                pendingRenderRef.current = { page, scale };
                return;
            }

            renderingRef.current = true;
            setRendering(true);

            try {
                const handle = await renderPageToCanvas(
                    pdfDoc,
                    page,
                    canvasRef.current!,
                    scale,
                );

                // Check if we've been superseded while getPage() was in progress
                if (id !== renderIdRef.current) {
                    handle.cancel();
                    return;
                }

                cancelRef.current = handle.cancel;
                await handle.promise;
            } catch (err) {
                // Ignore cancellation errors
                const msg = err instanceof Error ? err.message : String(err);
                if (
                    msg.includes('Rendering cancelled') ||
                    msg.includes('cancelled')
                ) {
                    // Expected — a newer render superseded this one
                } else if (id === renderIdRef.current) {
                    setError(msg || 'Failed to render page');
                }
            } finally {
                renderingRef.current = false;
                cancelRef.current = null;

                if (id === renderIdRef.current) {
                    setRendering(false);
                }

                // If a newer render was requested while we were busy, run it now
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
            // Cancel on cleanup
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
