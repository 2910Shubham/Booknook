'use client';

import { useEffect } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { useSettingsStore } from '@/store/settingsStore';
import { SHORTCUTS } from '@/config/shortcuts';

export function useKeyboardShortcuts() {
    const nextPage = usePdfStore((s) => s.nextPage);
    const prevPage = usePdfStore((s) => s.prevPage);
    const zoomIn = usePdfStore((s) => s.zoomIn);
    const zoomOut = usePdfStore((s) => s.zoomOut);
    const resetZoom = usePdfStore((s) => s.resetZoom);
    const toggleFocusMode = useSettingsStore((s) => s.toggleFocusMode);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            switch (e.key) {
                case SHORTCUTS.PREV_PAGE:
                    e.preventDefault();
                    prevPage();
                    break;
                case SHORTCUTS.NEXT_PAGE:
                    e.preventDefault();
                    nextPage();
                    break;
                case SHORTCUTS.TOGGLE_FOCUS:
                    e.preventDefault();
                    toggleFocusMode();
                    break;
                case SHORTCUTS.ZOOM_IN:
                case '=':
                    e.preventDefault();
                    zoomIn();
                    break;
                case SHORTCUTS.ZOOM_OUT:
                    e.preventDefault();
                    zoomOut();
                    break;
                case SHORTCUTS.ZOOM_RESET:
                    if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        resetZoom();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextPage, prevPage, zoomIn, zoomOut, resetZoom, toggleFocusMode]);
}
