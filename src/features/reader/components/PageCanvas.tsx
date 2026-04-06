'use client';

import React from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { useSettingsStore } from '@/store/settingsStore';
import Spinner from '@/components/ui/Spinner';
import type { ThemeMode } from '@/types';
import AnnotationCanvas from '@/features/annotations/components/AnnotationCanvas';

// CSS filter strings that transform the white-bg PDF for each theme.
// Light: no change. Dark: invert colors. Sepia: warm tint. Night: inverted + dimmed red.
const CANVAS_FILTERS: Record<ThemeMode, string> = {
    light: 'none',
    dark: 'invert(0.88) hue-rotate(180deg)',
    sepia: 'sepia(0.35) brightness(0.95)',
    night: 'invert(0.88) hue-rotate(180deg) brightness(0.5) sepia(0.5) saturate(2)',
    'eye-protection': 'sepia(0.7) brightness(0.9) contrast(0.9)',
};

interface PageCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function PageCanvas({ canvasRef }: PageCanvasProps) {
    const isRendering = usePdfStore((s) => s.isRendering);
    const isLoading = usePdfStore((s) => s.isLoading);
    const error = usePdfStore((s) => s.error);
    const pdfDoc = usePdfStore((s) => s.pdfDoc);
    const theme = useSettingsStore((s) => s.theme);

    if (error) {
        return (
            <div className="canvas-message">
                <p className="canvas-error-text">{error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="canvas-message">
                <Spinner size={40} />
                <p className="canvas-loading-text">Loading document…</p>
            </div>
        );
    }

    if (!pdfDoc) {
        return (
            <div className="canvas-message">
                <p className="canvas-loading-text">No document loaded</p>
            </div>
        );
    }

    return (
        <div className="canvas-wrapper">
            {isRendering && (
                <div className="canvas-spinner-overlay">
                    <Spinner size={28} />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="pdf-canvas"
                style={{ filter: CANVAS_FILTERS[theme] }}
            />
            <AnnotationCanvas pdfCanvasRef={canvasRef} />
        </div>
    );
}
