'use client';

import { useEffect, useRef } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { ZOOM_MIN, ZOOM_MAX } from '@/lib/constants';

const SWIPE_THRESHOLD = 50; // px minimum to count as swipe
const TAP_ZONE_RATIO = 0.20; // 20% of screen width

export function useTouchGestures(containerRef: React.RefObject<HTMLElement | null>) {
    const setZoom = usePdfStore((s) => s.setZoom);
    const resetZoom = usePdfStore((s) => s.resetZoom);
    const nextPage = usePdfStore((s) => s.nextPage);
    const prevPage = usePdfStore((s) => s.prevPage);

    const initialDistance = useRef<number | null>(null);
    const initialZoom = useRef<number>(1);
    const lastTapTime = useRef<number>(0);

    // Swipe tracking
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const touchStartTime = useRef<number>(0);
    const isSwiping = useRef(false);
    const isPinching = useRef(false);

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
            // Pinch-to-zoom (two fingers)
            if (e.touches.length === 2) {
                e.preventDefault();
                isPinching.current = true;
                initialDistance.current = getDistance(e.touches);
                initialZoom.current = usePdfStore.getState().zoom;
                return;
            }

            // Single finger — track for swipe or tap
            if (e.touches.length === 1) {
                touchStartX.current = e.touches[0].clientX;
                touchStartY.current = e.touches[0].clientY;
                touchStartTime.current = Date.now();
                isSwiping.current = false;
                isPinching.current = false;

                // Double-tap detection
                const now = Date.now();
                if (now - lastTapTime.current < 300) {
                    e.preventDefault();
                    resetZoom();
                    lastTapTime.current = 0;
                    return;
                }
                lastTapTime.current = now;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            // Pinch-to-zoom
            if (e.touches.length === 2 && initialDistance.current !== null) {
                e.preventDefault();
                isPinching.current = true;
                const currentDistance = getDistance(e.touches);
                const ratio = currentDistance / initialDistance.current;
                const newZoom = Math.max(
                    ZOOM_MIN,
                    Math.min(ZOOM_MAX, initialZoom.current * ratio),
                );
                setZoom(Math.round(newZoom * 100) / 100);
                return;
            }

            // Single finger — mark as swiping if moved enough horizontally
            if (e.touches.length === 1 && !isPinching.current) {
                const dx = e.touches[0].clientX - touchStartX.current;
                const dy = e.touches[0].clientY - touchStartY.current;
                // Only treat as swipe if horizontal movement > vertical
                if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
                    isSwiping.current = true;
                }
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            // Reset pinch state
            if (isPinching.current) {
                initialDistance.current = null;
                isPinching.current = false;
                return;
            }

            const isMobile = window.innerWidth < 768;
            if (!isMobile) return;

            const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
            const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
            const dx = endX - touchStartX.current;
            const dy = endY - touchStartY.current;
            const elapsed = Date.now() - touchStartTime.current;

            // Swipe navigation (horizontal swipe, completed quickly)
            if (isSwiping.current && Math.abs(dx) > SWIPE_THRESHOLD && elapsed < 500) {
                if (dx > 0) {
                    prevPage(); // Swipe right = previous
                } else {
                    nextPage(); // Swipe left = next
                }
                isSwiping.current = false;
                return;
            }

            // Tap zone navigation (quick tap, minimal movement)
            if (!isSwiping.current && Math.abs(dx) < 10 && Math.abs(dy) < 10 && elapsed < 300) {
                const screenWidth = window.innerWidth;
                const tapX = endX;

                if (tapX < screenWidth * TAP_ZONE_RATIO) {
                    prevPage(); // Left 20% = previous
                } else if (tapX > screenWidth * (1 - TAP_ZONE_RATIO)) {
                    nextPage(); // Right 20% = next
                }
                // Middle 60% = no action (allows normal interaction)
            }

            isSwiping.current = false;
        };

        el.addEventListener('touchstart', handleTouchStart, { passive: false });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd);

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [containerRef, setZoom, resetZoom, nextPage, prevPage]);
}
