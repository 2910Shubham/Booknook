'use client';

import React from 'react';
import { ANNOTATION_COLORS, type AnnotationColor } from '../types';

interface ColorPaletteProps {
    activeColor: AnnotationColor;
    onSelect: (color: AnnotationColor) => void;
}

export default function ColorPalette({ activeColor, onSelect }: ColorPaletteProps) {
    return (
        <div className="annotation-color-palette">
            {ANNOTATION_COLORS.map((color) => (
                <button
                    key={color}
                    type="button"
                    className={`annotation-color-swatch ${
                        activeColor === color ? 'annotation-color-active' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onSelect(color)}
                    aria-label={`Select color ${color}`}
                />
            ))}
        </div>
    );
}
