'use client';

import React from 'react';

interface EraserCursorProps {
    x: number;
    y: number;
    radius: number;
    visible: boolean;
}

export default function EraserCursor({ x, y, radius, visible }: EraserCursorProps) {
    if (!visible) return null;
    return (
        <div
            className="eraser-cursor"
            style={{
                width: radius * 2,
                height: radius * 2,
                transform: `translate(${x - radius}px, ${y - radius}px)`,
            }}
        />
    );
}
