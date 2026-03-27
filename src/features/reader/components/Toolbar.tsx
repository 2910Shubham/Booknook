'use client';

import React from 'react';
import { Settings, EyeOff, BookOpen } from 'lucide-react';
import NavigationControls from './NavigationControls';
import ZoomControls from './ZoomControls';
import PageIndicator from './PageIndicator';
import FullscreenButton from './FullscreenButton';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { usePdfStore } from '@/store/pdfStore';

interface ToolbarProps {
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onToggleFocus: () => void;
    onOpenSettings: () => void;
    onClose: () => void;
}

export default function Toolbar({
    isFullscreen,
    onToggleFullscreen,
    onToggleFocus,
    onOpenSettings,
    onClose,
}: ToolbarProps) {
    const fileName = usePdfStore((s) => s.fileName);
    const totalPages = usePdfStore((s) => s.totalPages);

    return (
        <div className="toolbar" id="reader-toolbar">
            {/* Left section: close + title */}
            <div className="toolbar-section toolbar-left">
                <Tooltip text="Close book" position="bottom">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Close book"
                        id="btn-close-book"
                    >
                        <BookOpen size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
                <span className="toolbar-title" title={fileName}>
                    {fileName.replace('.pdf', '')}
                </span>
            </div>

            {/* Center section: navigation + page indicator */}
            <div className="toolbar-section toolbar-center">
                <NavigationControls />
                {totalPages > 0 && <PageIndicator />}
            </div>

            {/* Right section: zoom + controls */}
            <div className="toolbar-section toolbar-right">
                <ZoomControls />

                <div className="toolbar-divider" />

                <Tooltip text="Focus mode (F)" position="top">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleFocus}
                        aria-label="Toggle focus mode"
                        id="btn-focus-mode"
                    >
                        <EyeOff size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>

                <FullscreenButton
                    isFullscreen={isFullscreen}
                    onToggle={onToggleFullscreen}
                />

                <Tooltip text="Settings" position="top">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onOpenSettings}
                        aria-label="Open settings"
                        id="btn-settings"
                    >
                        <Settings size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
}
