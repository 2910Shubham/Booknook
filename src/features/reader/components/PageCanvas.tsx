'use client';

import React, { useRef, useEffect, useState } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import Spinner from '@/components/ui/Spinner';

interface PageCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function PageCanvas({ canvasRef }: PageCanvasProps) {
    const isRendering = usePdfStore((s) => s.isRendering);
    const isLoading = usePdfStore((s) => s.isLoading);
    const error = usePdfStore((s) => s.error);
    const pdfDoc = usePdfStore((s) => s.pdfDoc);

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
            <canvas ref={canvasRef} className="pdf-canvas" />
        </div>
    );
}
