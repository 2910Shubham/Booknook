import { useEffect, useRef } from 'react';
import type { Annotation, PenAnnotation } from '../types';
import { drawAnnotations, drawPenPreview } from '../utils/canvasHelpers';
import { createAnnotationId } from '../utils/createId';

interface UsePenToolProps {
    active: boolean;
    page: number;
    color: string;
    strokeWidth: number;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    getCanvasPoint: (clientX: number, clientY: number) => {
        x: number;
        y: number;
        nx: number;
        ny: number;
    } | null;
    annotationsRef: React.MutableRefObject<Annotation[]>;
    addAnnotation: (annotation: PenAnnotation) => void;
    redraw: () => void;
}

export function usePenTool({
    active,
    page,
    color,
    strokeWidth,
    canvasRef,
    getCanvasPoint,
    annotationsRef,
    addAnnotation,
    redraw,
}: UsePenToolProps) {
    const isDrawingRef = useRef(false);
    const pointsRef = useRef<{ x: number; y: number }[]>([]);
    const normalizedRef = useRef<{ x: number; y: number }[]>([]);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleStart = (clientX: number, clientY: number) => {
            const point = getCanvasPoint(clientX, clientY);
            if (!point) return;
            isDrawingRef.current = true;
            pointsRef.current = [{ x: point.x, y: point.y }];
            normalizedRef.current = [{ x: point.nx, y: point.ny }];
        };

        const handleMove = (clientX: number, clientY: number) => {
            if (!isDrawingRef.current) return;
            const point = getCanvasPoint(clientX, clientY);
            if (!point) return;

            const last = pointsRef.current[pointsRef.current.length - 1];
            const dx = point.x - last.x;
            const dy = point.y - last.y;
            if (Math.hypot(dx, dy) < 1) return;

            pointsRef.current.push({ x: point.x, y: point.y });
            normalizedRef.current.push({ x: point.nx, y: point.ny });

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            drawAnnotations(ctx, annotationsRef.current, canvas.width, canvas.height);
            drawPenPreview(ctx, color, pointsRef.current, strokeWidth);
        };

        const handleEnd = (clientX: number, clientY: number) => {
            if (!isDrawingRef.current) return;
            const point = getCanvasPoint(clientX, clientY);
            if (point) {
                pointsRef.current.push({ x: point.x, y: point.y });
                normalizedRef.current.push({ x: point.nx, y: point.ny });
            }

            if (normalizedRef.current.length > 1) {
                addAnnotation({
                    id: createAnnotationId(),
                    tool: 'pen',
                    page,
                    color,
                    createdAt: Date.now(),
                    points: normalizedRef.current,
                    width: strokeWidth,
                });
            } else {
                redraw();
            }

            isDrawingRef.current = false;
            pointsRef.current = [];
            normalizedRef.current = [];
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
    }, [
        active,
        page,
        color,
        strokeWidth,
        canvasRef,
        getCanvasPoint,
        annotationsRef,
        addAnnotation,
        redraw,
    ]);
}
