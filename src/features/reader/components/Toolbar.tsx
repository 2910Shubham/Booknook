'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Settings,
    EyeOff,
    BookOpen,
    ArrowLeft,
    Menu,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import NavigationControls from './NavigationControls';
import ZoomControls from './ZoomControls';
import PageIndicator from './PageIndicator';
import FullscreenButton from './FullscreenButton';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { usePdfStore } from '@/store/pdfStore';
import SyncIndicator from '@/components/ui/SyncIndicator';
import ProfileMenu from '@/components/ui/ProfileMenu';

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
    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current?.contains(target)) return;
            if (menuButtonRef.current?.contains(target)) return;
            setMenuOpen(false);
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isMenuOpen]);

    return (
        <div className="toolbar" id="reader-toolbar">
            {/* Left section: close + title */}
            <div className="toolbar-section toolbar-left">
                <Tooltip text="Back to home" position="bottom">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        aria-label="Back to home"
                    >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        <span className="toolbar-back-label">Back to Home</span>
                    </Button>
                </Tooltip>
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
                <div className="toolbar-actions">
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

                    <SyncIndicator />
                    <ProfileMenu />
                </div>

                <button
                    ref={menuButtonRef}
                    type="button"
                    className="toolbar-menu-button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    aria-label="Open reader menu"
                >
                    <Menu size={18} strokeWidth={1.5} />
                </button>
            </div>

            {isMenuOpen && (
                <div ref={menuRef} className="toolbar-menu" role="menu">
                    <div className="toolbar-menu-section">
                        <div className="toolbar-menu-title">Navigation</div>
                        <NavigationControls />
                        {totalPages > 0 && <PageIndicator />}
                    </div>
                    <div className="toolbar-menu-section">
                        <div className="toolbar-menu-title">Zoom</div>
                        <ZoomControls />
                    </div>
                    <div className="toolbar-menu-section">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleFocus}
                            className="toolbar-menu-action"
                        >
                            <EyeOff size={16} strokeWidth={1.5} />
                            Focus mode
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleFullscreen}
                            className="toolbar-menu-action"
                        >
                            {isFullscreen ? (
                                <Minimize2 size={16} strokeWidth={1.5} />
                            ) : (
                                <Maximize2 size={16} strokeWidth={1.5} />
                            )}
                            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onOpenSettings}
                            className="toolbar-menu-action"
                        >
                            <Settings size={16} strokeWidth={1.5} />
                            Settings
                        </Button>
                    </div>
                    <div className="toolbar-menu-section toolbar-menu-footer">
                        <SyncIndicator />
                        <ProfileMenu />
                    </div>
                </div>
            )}
        </div>
    );
}
