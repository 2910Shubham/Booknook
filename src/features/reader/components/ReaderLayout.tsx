'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSyncStore } from '@/store/syncStore';
import { enqueue } from '@/lib/offlineQueue';
import { isLocalBookId } from '@/lib/localLibrary';
import { usePDF } from '../hooks/usePDF';
import { useFullscreen } from '../hooks/useFullscreen';
import { useFocusMode } from '../hooks/useFocusMode';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTouchGestures } from '../hooks/useTouchGestures';
import Toolbar from './Toolbar';
import PageCanvas from './PageCanvas';
import PageTransition from './PageTransition';
import FocusModeOverlay from './FocusModeOverlay';
import dynamic from 'next/dynamic';

const SettingsPanel = dynamic(
    () => import('@/features/settings/components/SettingsPanel'),
    { ssr: false },
);
const AnnotationToolbar = dynamic(
    () => import('@/features/annotations/components/AnnotationToolbar'),
    { ssr: false },
);

interface ReaderLayoutProps {
    onClose: () => void;
}

export default function ReaderLayout({ onClose }: ReaderLayoutProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const layoutRef = useRef<HTMLDivElement>(null);
    const sessionStartRef = useRef<number | null>(null);
    const sessionStartPageRef = useRef<number | null>(null);
    const currentPageRef = useRef(1);
    const bookIdRef = useRef<string | null>(null);

    const isSettingsOpen = useSettingsStore((s) => s.isSettingsOpen);
    const openSettings = useSettingsStore((s) => s.openSettings);
    const closeSettings = useSettingsStore((s) => s.closeSettings);
    const currentPage = usePdfStore((s) => s.currentPage);
    const bookId = usePdfStore((s) => s.bookId);
    const beginSync = useSyncStore((s) => s.begin);
    const endSync = useSyncStore((s) => s.end);

    // Hooks
    usePDF(canvasRef, containerRef);
    const { isFullscreen, toggleFullscreen } = useFullscreen(layoutRef);
    const { focusMode, toggleFocusMode, exitFocus } = useFocusMode();
    useKeyboardShortcuts();
    useTouchGestures(containerRef);

    useEffect(() => {
        currentPageRef.current = currentPage;
    }, [currentPage]);

    const flushSession = useCallback(async () => {
        const activeBookId = bookIdRef.current;
        const startedAt = sessionStartRef.current;
        const startPage = sessionStartPageRef.current;

        if (!activeBookId || startedAt === null || startPage === null) return;
        if (isLocalBookId(activeBookId)) return;

        const duration = Math.floor((Date.now() - startedAt) / 1000);
        const pagesRead = Math.abs(currentPageRef.current - startPage);

        if (duration <= 10) return;

        beginSync();
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ bookId: activeBookId, duration, pagesRead }),
            });

            if (!response.ok) {
                enqueue({
                    id: `session-${Date.now()}`,
                    type: 'log_session',
                    payload: { bookId: activeBookId, duration, pagesRead },
                    createdAt: Date.now(),
                });
            }
        } catch {
            enqueue({
                id: `session-${Date.now()}`,
                type: 'log_session',
                payload: { bookId: activeBookId, duration, pagesRead },
                createdAt: Date.now(),
            });
        } finally {
            endSync();
        }
    }, [beginSync, endSync]);

    useEffect(() => {
        if (bookIdRef.current && bookIdRef.current !== bookId) {
            void flushSession();
        }

        bookIdRef.current = bookId;
        sessionStartRef.current = null;
        sessionStartPageRef.current = null;
    }, [bookId, flushSession]);

    useEffect(() => {
        if (!bookId) return;

        if (sessionStartRef.current === null) {
            sessionStartRef.current = Date.now();
            sessionStartPageRef.current = currentPage;
            return;
        }

        if (
            sessionStartPageRef.current !== null &&
            sessionStartPageRef.current !== currentPage &&
            Date.now() - sessionStartRef.current < 3000
        ) {
            sessionStartPageRef.current = currentPage;
        }
    }, [bookId, currentPage]);

    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                void flushSession();
                sessionStartRef.current = null;
                sessionStartPageRef.current = null;
                return;
            }

            if (document.visibilityState === 'visible' && bookIdRef.current) {
                sessionStartRef.current = Date.now();
                sessionStartPageRef.current = currentPageRef.current;
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [flushSession]);

    useEffect(() => {
        return () => {
            void flushSession();
        };
    }, [flushSession]);

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        root.classList.add('reader-viewport');
        body.classList.add('reader-viewport');
        return () => {
            root.classList.remove('reader-viewport');
            body.classList.remove('reader-viewport');
        };
    }, []);

    return (
        <div
            ref={layoutRef}
            className={`reader-layout reader-root ${focusMode ? 'reader-focus-mode' : ''}`}
            id="reader-layout"
        >
            {/* Toolbar */}
            <div className={`toolbar-wrapper ${focusMode ? 'toolbar-hidden' : ''}`}>
                <Toolbar
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    onToggleFocus={toggleFocusMode}
                    onOpenSettings={openSettings}
                    onClose={onClose}
                />
            </div>

            {/* Canvas area */}
            <div ref={containerRef} className="reader-content" id="reader-content">
                <PageTransition>
                    <PageCanvas canvasRef={canvasRef} />
                </PageTransition>
            </div>

            <AnnotationToolbar />

            {/* Focus mode exit button */}
            <FocusModeOverlay focusMode={focusMode} onExit={exitFocus} />

            {/* Settings panel */}
            {isSettingsOpen && (
                <SettingsPanel isOpen={isSettingsOpen} onClose={closeSettings} />
            )}
        </div>
    );
}
