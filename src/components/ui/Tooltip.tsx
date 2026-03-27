'use client';

import React, { useState, useRef } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({
    text,
    children,
    position = 'top',
}: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const show = () => {
        timeoutRef.current = setTimeout(() => setVisible(true), 400);
    };

    const hide = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setVisible(false);
    };

    return (
        <div
            className="tooltip-wrapper"
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {children}
            {visible && (
                <span className={`tooltip tooltip-${position}`} role="tooltip">
                    {text}
                </span>
            )}
        </div>
    );
}
