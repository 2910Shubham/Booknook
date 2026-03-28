'use client';

import React, { useEffect, useRef } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePDF } from '../hooks/usePDF';
import { useFullscreen } from '../hooks/useFullscreen';
import { useFocusMode } from '../hooks/useFocusMode';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTouchGestures } from '../hooks/useTouchGestures';
import Toolbar from './Toolbar';
import PageCanvas from './PageCanvas';
import PageTransition from './PageTransition';
import FocusModeOverlay from './FocusModeOverlay';
import SettingsPanel from '@/features/settings/components/SettingsPanel';
import AnnotationToolbar from '@/features/annotations/components/AnnotationToolbar';

interface ReaderLayoutProps {
    onClose: () => void;
}

export default function ReaderLayout({ onClose }: ReaderLayoutProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const layoutRef = useRef<HTMLDivElement>(null);

    const isSettingsOpen = useSettingsStore((s) => s.isSettingsOpen);
    const openSettings = useSettingsStore((s) => s.openSettings);
    const closeSettings = useSettingsStore((s) => s.closeSettings);

    // Hooks
    usePDF(canvasRef, containerRef);
    const { isFullscreen, toggleFullscreen } = useFullscreen(layoutRef);
    const { focusMode, toggleFocusMode, exitFocus } = useFocusMode();
    useKeyboardShortcuts();
    useTouchGestures(containerRef);

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
            <SettingsPanel isOpen={isSettingsOpen} onClose={closeSettings} />
        </div>
    );
}
