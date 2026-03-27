'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PAGE_TRANSITION_DURATION } from '@/lib/constants';
import { usePdfStore } from '@/store/pdfStore';

interface PageTransitionProps {
    children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    const currentPage = usePdfStore((s) => s.currentPage);
    const [transitioning, setTransitioning] = useState(false);
    const prevPage = useRef(currentPage);

    useEffect(() => {
        if (prevPage.current !== currentPage) {
            setTransitioning(true);
            const timer = setTimeout(() => {
                setTransitioning(false);
            }, PAGE_TRANSITION_DURATION);
            prevPage.current = currentPage;
            return () => clearTimeout(timer);
        }
    }, [currentPage]);

    return (
        <div
            className={`page-transition ${transitioning ? 'page-transition-active' : ''}`}
            style={{ '--transition-duration': `${PAGE_TRANSITION_DURATION}ms` } as React.CSSProperties}
        >
            {children}
        </div>
    );
}
