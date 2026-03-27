'use client';

import React from 'react';
import { useReaderSettings } from '../hooks/useReaderSettings';
import { FONT_SIZE_LABELS } from '@/lib/constants';
import type { FontSize } from '@/types';

const SIZES: FontSize[] = ['small', 'medium', 'large'];

export default function FontSizeControl() {
    const { fontSize, setFontSize } = useReaderSettings();

    return (
        <div className="settings-group">
            <label className="settings-label">Text Size</label>
            <div className="font-size-options">
                {SIZES.map((size) => (
                    <button
                        key={size}
                        className={`font-size-option ${fontSize === size ? 'font-size-active' : ''}`}
                        onClick={() => setFontSize(size)}
                        aria-label={`${size} text size`}
                        aria-pressed={fontSize === size}
                        id={`font-size-${size}`}
                    >
                        <span
                            className="font-size-preview"
                            style={{
                                fontSize:
                                    size === 'small' ? '12px' : size === 'medium' ? '15px' : '18px',
                            }}
                        >
                            {FONT_SIZE_LABELS[size]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
