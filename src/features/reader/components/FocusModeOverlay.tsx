'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FocusModeOverlayProps {
    focusMode: boolean;
    onExit: () => void;
}

export default function FocusModeOverlay({
    focusMode,
    onExit,
}: FocusModeOverlayProps) {
    if (!focusMode) return null;

    return (
        <button
            className="focus-exit-button"
            onClick={onExit}
            aria-label="Exit focus mode"
            id="btn-exit-focus"
        >
            <Eye size={18} strokeWidth={1.5} />
        </button>
    );
}
