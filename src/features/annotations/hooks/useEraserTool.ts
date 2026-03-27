import { useEffect, useState } from 'react';
import type { Annotation } from '../types';
import { findHitAnnotation } from '../utils/hitTest';

interface UseEraserToolProps {
    active: boolean;
    page: number;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    getCanvasPoint: (clientX: number, clientY: number) => {
        x: number;
        y: number;
        nx: number;
        ny: number;
        cssX: number;
        cssY: number;
    } | null;
    annotationsRef: React.MutableRefObject<Annotation[]>;
    removeAnnotation: (page: number, id: string) => void;
    redraw: () => void;
}

const ERASER_RADIUS = 20;

export function useEraserTool({
    active,
    page,
    canvasRef,
    getCanvasPoint,
    annotationsRef,
    removeAnnotation,
    redraw,
}: UseEraserToolProps) {
    const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        if (!active) {
            setCursor(null);
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;
        let isErasing = false;

        const handleErase = (clientX: number, clientY: number) => {
            const point = getCanvasPoint(clientX, clientY);
            if (!point) return;
            setCursor({ x: point.cssX, y: point.cssY });

            if (!isErasing) return;
            const hit = findHitAnnotation(
                annotationsRef.current,
                point.x,
                point.y,
                ERASER_RADIUS,
                canvas.width,
                canvas.height,
            );
            if (hit) {
                removeAnnotation(page, hit.id);
                redraw();
            }
        };

        const handleMouseDown = (event: MouseEvent) => {
            event.preventDefault();
            isErasing = true;
            handleErase(event.clientX, event.clientY);
        };

        const handleMouseMove = (event: MouseEvent) => {
            event.preventDefault();
            handleErase(event.clientX, event.clientY);
        };

        const handleMouseUp = () => {
            isErasing = false;
        };

        const handleTouchStart = (event: TouchEvent) => {
            if (!event.touches[0]) return;
            event.preventDefault();
            isErasing = true;
            handleErase(event.touches[0].clientX, event.touches[0].clientY);
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!event.touches[0]) return;
            event.preventDefault();
            handleErase(event.touches[0].clientX, event.touches[0].clientY);
        };

        const handleTouchEnd = () => {
            isErasing = false;
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
    }, [active, page, canvasRef, getCanvasPoint, annotationsRef, removeAnnotation, redraw]);

    return { cursor, radius: ERASER_RADIUS };
}
