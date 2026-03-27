'use client';

import React from 'react';
import { Maximize, Minimize } from 'lucide-react';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';

interface FullscreenButtonProps {
    isFullscreen: boolean;
    onToggle: () => void;
}

export default function FullscreenButton({
    isFullscreen,
    onToggle,
}: FullscreenButtonProps) {
    return (
        <Tooltip text={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} position="top">
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                id="btn-fullscreen"
            >
                {isFullscreen ? (
                    <Minimize size={18} strokeWidth={1.5} />
                ) : (
                    <Maximize size={18} strokeWidth={1.5} />
                )}
            </Button>
        </Tooltip>
    );
}
