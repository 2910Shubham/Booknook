'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { useProgressStore } from '@/store/progressStore';
import { loadPdfDocument, renderPageToCanvas } from '@/lib/pdf';
import { enqueue } from '@/lib/offlineQueue';
import { useSyncStore } from '@/store/syncStore';
import { isLocalBookId } from '@/lib/localLibrary';

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
    const bookId = usePdfStore((s) => s.bookId);
    const setPdfDoc = usePdfStore((s) => s.setPdfDoc);
    const setLoading = usePdfStore((s) => s.setLoading);
    const setRendering = usePdfStore((s) => s.setRendering);
    const setError = usePdfStore((s) => s.setError);
    const setBaseScale = usePdfStore((s) => s.setBaseScale);
    const setCurrentPage = usePdfStore((s) => s.setCurrentPage);

    const saveProgress = useProgressStore((s) => s.saveProgress);
    const getProgress = useProgressStore((s) => s.getProgress);
    const addToast = useProgressStore((s) => s.addToast);
    const beginSync = useSyncStore((s) => s.begin);
    const endSync = useSyncStore((s) => s.end);

    // Render serialization
    const renderIdRef = useRef(0);
    const renderingRef = useRef(false);
    const pendingRenderRef = useRef<{ page: number; scale: number } | null>(null);
    const cancelRef = useRef<(() => void) | null>(null);
    const resizeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const fetchedProgressRef = useRef(false);
    const remoteBookId = bookId && !isLocalBookId(bookId) ? bookId : null;

    const getContainerBox = useCallback(() => {
        const container = containerRef.current;
        if (!container) return null;
        const rect = container.getBoundingClientRect();
        const styles = window.getComputedStyle(container);
        const paddingX =
            parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        const paddingY =
            parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        const width = Math.max(0, rect.width - paddingX);
        const height = Math.max(0, rect.height - paddingY);
        return { width, height };
    }, [containerRef]);

    const calculateOptimalScale = useCallback(
        (
            viewport: { width: number; height: number },
            container: { width: number; height: number },
            mode: 'fit-width' | 'fit-height' | 'fit-page' | 'cover',
        ) => {
            const scaleByWidth = container.width / viewport.width;
            const scaleByHeight = container.height / viewport.height;

            switch (mode) {
                case 'fit-height':
                    return scaleByHeight;
                case 'fit-page':
                    return Math.min(scaleByWidth, scaleByHeight);
                case 'cover':
                    return Math.max(scaleByWidth, scaleByHeight);
                case 'fit-width':
                default:
                    return scaleByWidth;
            }
        },
        [],
    );

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

    useEffect(() => {
        fetchedProgressRef.current = false;
    }, [remoteBookId]);

    useEffect(() => {
        if (!pdfDoc || !remoteBookId || fetchedProgressRef.current) return;
        fetchedProgressRef.current = true;

        const loadProgress = async () => {
            try {
                const response = await fetch(`/api/progress?bookId=${remoteBookId}`, {
                    credentials: 'include',
                });
                if (!response.ok) return;
                const contentType = response.headers.get('content-type') ?? '';
                if (!contentType.includes('application/json')) return;
                const { progress } = await response.json();
                if (progress?.current_page && progress.current_page !== currentPage) {
                    setCurrentPage(progress.current_page);
                    addToast(`Resumed from page ${progress.current_page}`, 'info');
                }
            } catch {
                // Ignore and fallback to local cache
            }
        };

        void loadProgress();
    }, [pdfDoc, remoteBookId, currentPage, setCurrentPage, addToast]);

    // ── Calculate base scale (fit/cover modes) ────────────────────────────────
    const calcBaseScale = useCallback(async () => {
        if (!pdfDoc) return;
        try {
            const page = await pdfDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale: 1 });
            const container = getContainerBox();
            if (!container || container.width === 0 || container.height === 0) {
                return;
            }

            const isMobile = window.innerWidth < 768;
            const mode = isMobile ? 'fit-width' : 'fit-page';
            const scale = calculateOptimalScale(viewport, container, mode);
            if (Number.isFinite(scale) && scale > 0) {
                setBaseScale(scale);
            }
        } catch {
            // Silently fail
        }
    }, [pdfDoc, currentPage, getContainerBox, calculateOptimalScale, setBaseScale]);

    // ── Debounced resize + orientation change ────────────────────────────
    useEffect(() => {
        calcBaseScale();

        const scheduleRecalc = (delay = 100) => {
            if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
            resizeTimerRef.current = setTimeout(() => {
                calcBaseScale();
            }, delay);
        };

        // ResizeObserver for the container
        let resizeObserver: ResizeObserver | null = null;
        if (containerRef.current) {
            resizeObserver = new ResizeObserver(() => scheduleRecalc(100));
            resizeObserver.observe(containerRef.current);
        }

        const handleOrientation = () => scheduleRecalc(150);
        const screenOrientation = window.screen?.orientation;
        screenOrientation?.addEventListener('change', handleOrientation);
        window.addEventListener('orientationchange', handleOrientation);

        return () => {
            if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current);
            if (resizeObserver) resizeObserver.disconnect();
            screenOrientation?.removeEventListener('change', handleOrientation);
            window.removeEventListener('orientationchange', handleOrientation);
        };
    }, [calcBaseScale, containerRef]);

    useEffect(() => {
        if (!pdfDoc) return;
        calcBaseScale();
    }, [pdfDoc, currentPage, calcBaseScale]);

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

        if (pdfDoc && remoteBookId && currentPage) {
            if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
            progressTimerRef.current = setTimeout(async () => {
                beginSync();
                try {
                    const response = await fetch('/api/progress', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            bookId: remoteBookId,
                            currentPage,
                            totalPages: pdfDoc.numPages,
                        }),
                    });
                    if (!response.ok) {
                        enqueue({
                            id: `progress-${Date.now()}`,
                            type: 'update_progress',
                            payload: {
                                bookId: remoteBookId,
                                currentPage,
                                totalPages: pdfDoc.numPages,
                            },
                            createdAt: Date.now(),
                        });
                    }
                } catch {
                    enqueue({
                        id: `progress-${Date.now()}`,
                        type: 'update_progress',
                        payload: {
                            bookId: remoteBookId,
                            currentPage,
                            totalPages: pdfDoc.numPages,
                        },
                        createdAt: Date.now(),
                    });
                } finally {
                    endSync();
                }
            }, 800);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, fileName, remoteBookId]);

    useEffect(() => {
        return () => {
            if (progressTimerRef.current) {
                clearTimeout(progressTimerRef.current);
            }
        };
    }, []);

    return { calcBaseScale };
}
