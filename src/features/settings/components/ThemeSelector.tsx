'use client';

import React from 'react';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { THEME_LABELS, THEME_PREVIEW_COLORS } from '@/config/theme';
import type { ThemeMode } from '@/types';

const THEMES: ThemeMode[] = ['light', 'dark', 'sepia', 'night'];

export default function ThemeSelector() {
    const { theme, setTheme } = useReaderSettings();

    return (
        <div className="settings-group">
            <label className="settings-label">Theme</label>
            <div className="theme-options">
                {THEMES.map((t) => (
                    <button
                        key={t}
                        className={`theme-option ${theme === t ? 'theme-option-active' : ''}`}
                        onClick={() => setTheme(t)}
                        aria-label={`${THEME_LABELS[t]} theme`}
                        aria-pressed={theme === t}
                        id={`theme-${t}`}
                    >
                        <span
                            className="theme-preview"
                            style={{
                                backgroundColor: THEME_PREVIEW_COLORS[t].bg,
                                color: THEME_PREVIEW_COLORS[t].fg,
                            }}
                        >
                            Aa
                        </span>
                        <span className="theme-option-label">{THEME_LABELS[t]}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
