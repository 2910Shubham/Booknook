'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
    onUpload: () => void;
}

export default function EmptyState({ onUpload }: EmptyStateProps) {
    return (
        <div className="library-empty">
            <div className="library-empty-illustration" aria-hidden="true">
                <svg viewBox="0 0 140 120" role="img">
                    <path
                        d="M12 22h45c12 0 22 10 22 22v56H34c-12 0-22-10-22-22V22z"
                        fill="#2a2320"
                        stroke="#3a332d"
                        strokeWidth="2"
                    />
                    <path
                        d="M128 22H83c-12 0-22 10-22 22v56h45c12 0 22-10 22-22V22z"
                        fill="#241e18"
                        stroke="#3a332d"
                        strokeWidth="2"
                    />
                    <path
                        d="M70 22v78"
                        stroke="#c8965a"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <h2 className="library-empty-title">Your library is empty</h2>
            <p className="library-empty-text">
                Upload your first book to get started.
            </p>
            <Button variant="filled" size="lg" onClick={onUpload}>
                Upload a PDF
            </Button>
        </div>
    );
}
