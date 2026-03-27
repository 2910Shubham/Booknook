import { useCallback, useEffect, useRef, useState } from 'react';

interface CanvasPoint {
    x: number;
    y: number;
    nx: number;
    ny: number;
    cssX: number;
    cssY: number;
}

interface CanvasMetrics {
    width: number;
    height: number;
    cssWidth: number;
    cssHeight: number;
}

export function useAnnotationCanvas(
    pdfCanvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
    const annotationCanvasRef = useRef<HTMLCanvasElement>(null);
    const [metrics, setMetrics] = useState<CanvasMetrics>({
        width: 0,
        height: 0,
        cssWidth: 0,
        cssHeight: 0,
    });

    const syncSize = useCallback(() => {
        const pdfCanvas = pdfCanvasRef.current;
        const annotationCanvas = annotationCanvasRef.current;
        if (!pdfCanvas || !annotationCanvas) return;

        const width = pdfCanvas.width;
        const height = pdfCanvas.height;

        if (width && height) {
            annotationCanvas.width = width;
            annotationCanvas.height = height;
        }

        const cssWidth = pdfCanvas.clientWidth || width;
        const cssHeight = pdfCanvas.clientHeight || height;
        annotationCanvas.style.width = `${cssWidth}px`;
        annotationCanvas.style.height = `${cssHeight}px`;

        setMetrics({ width, height, cssWidth, cssHeight });
    }, [pdfCanvasRef]);

    useEffect(() => {
        syncSize();
        const pdfCanvas = pdfCanvasRef.current;
        if (!pdfCanvas) return;

        const resizeObserver = new ResizeObserver(() => {
            syncSize();
        });

        resizeObserver.observe(pdfCanvas);

        return () => resizeObserver.disconnect();
    }, [pdfCanvasRef, syncSize]);

    const getCanvasPoint = useCallback(
        (clientX: number, clientY: number): CanvasPoint | null => {
            const canvas = annotationCanvasRef.current;
            if (!canvas) return null;
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width ? canvas.width / rect.width : 1;
            const scaleY = rect.height ? canvas.height / rect.height : 1;
            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;
            if (!canvas.width || !canvas.height) return null;
            return {
                x,
                y,
                nx: x / canvas.width,
                ny: y / canvas.height,
                cssX: clientX - rect.left,
                cssY: clientY - rect.top,
            };
        },
        [],
    );

    return { annotationCanvasRef, metrics, getCanvasPoint, syncSize };
}
