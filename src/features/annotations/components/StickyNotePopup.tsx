'use client';

import React, { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';

interface StickyNotePopupProps {
    x: number;
    y: number;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    onDelete: () => void;
    onClose: () => void;
}

export default function StickyNotePopup({
    x,
    y,
    value,
    onChange,
    onSave,
    onDelete,
    onClose,
}: StickyNotePopupProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    return (
        <div
            className="sticky-note-popup"
            style={{ left: x, top: y }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
        >
            <textarea
                ref={textareaRef}
                className="sticky-note-textarea"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Write your note..."
                rows={4}
            />
            <div className="sticky-note-actions">
                <Button variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                </Button>
                <div className="sticky-note-action-group">
                    <Button variant="outline" size="sm" onClick={onDelete}>
                        Delete
                    </Button>
                    <Button variant="filled" size="sm" onClick={onSave}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
}
