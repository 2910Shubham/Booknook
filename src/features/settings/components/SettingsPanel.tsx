'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import FontSizeControl from './FontSizeControl';
import Button from '@/components/ui/Button';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`settings-backdrop ${isOpen ? 'settings-backdrop-visible' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={`settings-panel ${isOpen ? 'settings-panel-open' : ''}`}
                role="dialog"
                aria-label="Reader settings"
                id="settings-panel"
            >
                <div className="settings-header">
                    <h2 className="settings-title">Settings</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        aria-label="Close settings"
                    >
                        <X size={18} strokeWidth={1.5} />
                    </Button>
                </div>

                <div className="settings-body">
                    <ThemeSelector />
                    <FontSizeControl />
                </div>
            </div>
        </>
    );
}
