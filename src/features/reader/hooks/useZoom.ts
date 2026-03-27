'use client';

import { useCallback } from 'react';
import { usePdfStore } from '@/store/pdfStore';

export function useZoom() {
    const zoom = usePdfStore((s) => s.zoom);
    const zoomIn = usePdfStore((s) => s.zoomIn);
    const zoomOut = usePdfStore((s) => s.zoomOut);
    const resetZoom = usePdfStore((s) => s.resetZoom);
    const setZoom = usePdfStore((s) => s.setZoom);

    const zoomPercentage = Math.round(zoom * 100);

    const handleZoomIn = useCallback(() => zoomIn(), [zoomIn]);
    const handleZoomOut = useCallback(() => zoomOut(), [zoomOut]);
    const handleReset = useCallback(() => resetZoom(), [resetZoom]);

    return {
        zoom,
        zoomPercentage,
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        resetZoom: handleReset,
        setZoom,
    };
}
