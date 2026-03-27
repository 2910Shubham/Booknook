'use client';

import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useZoom } from '../hooks/useZoom';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';

export default function ZoomControls() {
    const { zoomPercentage, zoomIn, zoomOut, resetZoom } = useZoom();

    return (
        <div className="zoom-controls">
            <Tooltip text="Zoom out (−)" position="top">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomOut}
                    aria-label="Zoom out"
                    id="btn-zoom-out"
                >
                    <ZoomOut size={18} strokeWidth={1.5} />
                </Button>
            </Tooltip>

            <span className="zoom-level" aria-live="polite">
                {zoomPercentage}%
            </span>

            <Tooltip text="Zoom in (+)" position="top">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomIn}
                    aria-label="Zoom in"
                    id="btn-zoom-in"
                >
                    <ZoomIn size={18} strokeWidth={1.5} />
                </Button>
            </Tooltip>

            <Tooltip text="Reset zoom (0)" position="top">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetZoom}
                    aria-label="Reset zoom"
                    id="btn-zoom-reset"
                >
                    <RotateCcw size={16} strokeWidth={1.5} />
                </Button>
            </Tooltip>
        </div>
    );
}
