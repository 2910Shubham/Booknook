'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export function useFullscreen(elementRef: React.RefObject<HTMLElement | null>) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement && elementRef.current) {
                await elementRef.current.requestFullscreen();
            } else if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch {
            // Fullscreen API not available or denied
        }
    }, [elementRef]);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch {
            // Silently fail
        }
    }, []);

    return { isFullscreen, toggleFullscreen, exitFullscreen };
}
