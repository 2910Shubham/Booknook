import { useEffect, useRef } from 'react';
import type { Annotation, UnderlineAnnotation } from '../types';
import { drawAnnotations, drawUnderlinePreview } from '../utils/canvasHelpers';

interface UseUnderlineProps {
    active: boolean;
    page: number;
    color: string;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    getCanvasPoint: (clientX: number, clientY: number) => {
        x: number;
        y: number;
        nx: number;
        ny: number;
    } | null;
    annotationsRef: React.MutableRefObject<Annotation[]>;
    addAnnotation: (annotation: UnderlineAnnotation) => void;
    redraw: () => void;
}

export function useUnderlineTool({
    active,
    page,
    color,
    canvasRef,
    getCanvasPoint,
    annotationsRef,
    addAnnotation,
    redraw,
}: UseUnderlineProps) {
    const isDrawingRef = useRef(false);
    const startRef = useRef<{ x: number; y: number; nx: number; ny: number } | null>(null);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleStart = (clientX: number, clientY: number) => {
            const point = getCanvasPoint(clientX, clientY);
            if (!point) return;
            isDrawingRef.current = true;
            startRef.current = { x: point.x, y: point.y, nx: point.nx, ny: point.ny };
        };

        const handleMove = (clientX: number, clientY: number) => {
            if (!isDrawingRef.current || !startRef.current) return;
            const point = getCanvasPoint(clientX, clientY);
            if (!point) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            drawAnnotations(ctx, annotationsRef.current, canvas.width, canvas.height);

            const x = Math.min(startRef.current.x, point.x);
            const width = Math.abs(startRef.current.x - point.x);
            const y = Math.max(startRef.current.y, point.y);
            drawUnderlinePreview(ctx, color, x, y, width);
        };

        const handleEnd = (clientX: number, clientY: number) => {
            if (!isDrawingRef.current || !startRef.current) return;
            const point = getCanvasPoint(clientX, clientY);
            if (!point) return;

            const nx = Math.min(startRef.current.nx, point.nx);
            const width = Math.abs(startRef.current.nx - point.nx);
            const ny = Math.max(startRef.current.ny, point.ny);

            if (width > 0.002) {
                addAnnotation({
                    id: crypto.randomUUID?.() || `${Date.now()}`,
                    tool: 'underline',
                    page,
                    color,
                    createdAt: Date.now(),
                    x: nx,
                    y: ny,
                    width,
                });
            } else {
                redraw();
            }

            isDrawingRef.current = false;
            startRef.current = null;
        };

        const handleMouseDown = (event: MouseEvent) => {
            event.preventDefault();
            handleStart(event.clientX, event.clientY);
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isDrawingRef.current) return;
            event.preventDefault();
            handleMove(event.clientX, event.clientY);
        };

        const handleMouseUp = (event: MouseEvent) => {
            if (!isDrawingRef.current) return;
            event.preventDefault();
            handleEnd(event.clientX, event.clientY);
        };

        const handleTouchStart = (event: TouchEvent) => {
            if (!event.touches[0]) return;
            event.preventDefault();
            handleStart(event.touches[0].clientX, event.touches[0].clientY);
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!event.touches[0] || !isDrawingRef.current) return;
            event.preventDefault();
            handleMove(event.touches[0].clientX, event.touches[0].clientY);
        };

        const handleTouchEnd = (event: TouchEvent) => {
            if (!isDrawingRef.current) return;
            event.preventDefault();
            const touch = event.changedTouches[0];
            if (touch) {
                handleEnd(touch.clientX, touch.clientY);
            }
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [active, page, color, canvasRef, getCanvasPoint, annotationsRef, addAnnotation, redraw]);
}
