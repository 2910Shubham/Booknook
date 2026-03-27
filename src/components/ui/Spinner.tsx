'use client';

import React from 'react';

interface SpinnerProps {
    size?: number;
    className?: string;
}

export default function Spinner({ size = 32, className = '' }: SpinnerProps) {
    return (
        <div className={`spinner-container ${className}`} role="status" aria-label="Loading">
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                className="spinner-svg"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="var(--border-primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="var(--accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="spinner-arc"
                />
            </svg>
        </div>
    );
}
