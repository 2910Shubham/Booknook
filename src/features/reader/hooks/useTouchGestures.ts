'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { ZOOM_MIN, ZOOM_MAX } from '@/lib/constants';

export function useTouchGestures(containerRef: React.RefObject<HTMLElement | null>) {
    const setZoom = usePdfStore((s) => s.setZoom);
    const resetZoom = usePdfStore((s) => s.resetZoom);
    const zoom = usePdfStore((s) => s.zoom);

    const initialDistance = useRef<number | null>(null);
    const initialZoom = useRef<number>(1);
    const lastTapTime = useRef<number>(0);

    const getDistance = (touches: TouchList): number => {
        if (touches.length < 2) return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                initialDistance.current = getDistance(e.touches);
                initialZoom.current = usePdfStore.getState().zoom;
            }

            // Double-tap detection
            if (e.touches.length === 1) {
                const now = Date.now();
                if (now - lastTapTime.current < 300) {
                    e.preventDefault();
                    resetZoom();
                }
                lastTapTime.current = now;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2 && initialDistance.current !== null) {
                e.preventDefault();
                const currentDistance = getDistance(e.touches);
                const ratio = currentDistance / initialDistance.current;
                const newZoom = Math.max(
                    ZOOM_MIN,
                    Math.min(ZOOM_MAX, initialZoom.current * ratio),
                );
                setZoom(Math.round(newZoom * 100) / 100);
            }
        };

        const handleTouchEnd = () => {
            initialDistance.current = null;
        };

        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [containerRef, setZoom, resetZoom]);
}
