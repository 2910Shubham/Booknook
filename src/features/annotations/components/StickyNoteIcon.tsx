'use client';

import React from 'react';
import type { NoteAnnotation } from '../types';

interface StickyNoteIconProps {
    note: NoteAnnotation;
    x: number;
    y: number;
    onClick: (note: NoteAnnotation, position: { x: number; y: number }) => void;
}

export default function StickyNoteIcon({ note, x, y, onClick }: StickyNoteIconProps) {
    const preview = note.text ? note.text.slice(0, 60) : 'Empty note';

    return (
        <button
            type="button"
            className="sticky-note-icon"
            style={{ left: x, top: y, borderColor: note.color }}
            onClick={() => onClick(note, { x, y })}
            aria-label="Open note"
        >
            <span className="sticky-note-fold" style={{ backgroundColor: note.color }} />
            <span className="sticky-note-tooltip">{preview}</span>
        </button>
    );
}
