'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePdfStore } from '@/store/pdfStore';

export default function PageIndicator() {
    const currentPage = usePdfStore((s) => s.currentPage);
    const totalPages = usePdfStore((s) => s.totalPages);
    const goToPage = usePdfStore((s) => s.goToPage);

    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleClick = () => {
        setInputValue(String(currentPage));
        setIsEditing(true);
    };

    const handleSubmit = () => {
        const page = parseInt(inputValue, 10);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            goToPage(page);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="page-indicator page-indicator-editing">
                <input
                    ref={inputRef}
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSubmit}
                    className="page-input"
                    aria-label="Go to page"
                    id="page-jump-input"
                />
                <span className="page-indicator-separator">of</span>
                <span className="page-indicator-total">{totalPages}</span>
            </div>
        );
    }

    return (
        <button
            className="page-indicator"
            onClick={handleClick}
            aria-label={`Page ${currentPage} of ${totalPages}. Click to jump to a page.`}
            id="page-indicator"
        >
            <span className="page-indicator-current">{currentPage}</span>
            <span className="page-indicator-separator">of</span>
            <span className="page-indicator-total">{totalPages}</span>
        </button>
    );
}
