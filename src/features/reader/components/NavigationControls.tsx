'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePdfStore } from '@/store/pdfStore';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';

export default function NavigationControls() {
    const currentPage = usePdfStore((s) => s.currentPage);
    const totalPages = usePdfStore((s) => s.totalPages);
    const nextPage = usePdfStore((s) => s.nextPage);
    const prevPage = usePdfStore((s) => s.prevPage);

    const isFirst = currentPage <= 1;
    const isLast = currentPage >= totalPages;

    return (
        <div className="nav-controls">
            <Tooltip text="Previous page (←)" position="top">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevPage}
                    disabled={isFirst}
                    aria-label="Previous page"
                    id="btn-prev-page"
                >
                    <ChevronLeft size={20} strokeWidth={1.5} />
                </Button>
            </Tooltip>

            <Tooltip text="Next page (→)" position="top">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextPage}
                    disabled={isLast}
                    aria-label="Next page"
                    id="btn-next-page"
                >
                    <ChevronRight size={20} strokeWidth={1.5} />
                </Button>
            </Tooltip>
        </div>
    );
}
