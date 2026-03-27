'use client';

import React from 'react';
import {
    MousePointer2,
    Highlighter,
    PenLine,
    Underline,
    NotebookPen,
    Eraser,
    Undo2,
    Trash2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { usePdfStore } from '@/store/pdfStore';
import { useAnnotationStore } from '../store/annotationStore';
import { useAnnotationUndo } from '../hooks/useAnnotationUndo';
import ColorPalette from './ColorPalette';

export default function AnnotationToolbar() {
    const pdfDoc = usePdfStore((s) => s.pdfDoc);
    const currentPage = usePdfStore((s) => s.currentPage);

    const activeTool = useAnnotationStore((s) => s.activeTool);
    const activeColor = useAnnotationStore((s) => s.activeColor);
    const strokeWidth = useAnnotationStore((s) => s.strokeWidth);
    const setActiveTool = useAnnotationStore((s) => s.setActiveTool);
    const setActiveColor = useAnnotationStore((s) => s.setActiveColor);
    const setStrokeWidth = useAnnotationStore((s) => s.setStrokeWidth);
    const clearPageAnnotations = useAnnotationStore((s) => s.clearPageAnnotations);

    const { undo, canUndo } = useAnnotationUndo(currentPage);

    if (!pdfDoc) return null;

    const handleClear = () => {
        if (window.confirm('Clear all annotations on this page?')) {
            clearPageAnnotations(currentPage);
        }
    };

    return (
        <div className="annotation-toolbar" aria-label="Annotation tools">
            <div className="annotation-toolbar-section">
                <Tooltip text="Cursor (Esc)" position="left">
                    <Button
                        variant="ghost"
                        size="icon"
                        active={activeTool === 'cursor'}
                        className={`annotation-tool-button ${
                            activeTool === 'cursor' ? 'annotation-tool-active' : ''
                        }`}
                        onClick={() => setActiveTool('cursor')}
                        aria-label="Cursor"
                    >
                        <MousePointer2 size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
                <Tooltip text="Highlighter (H)" position="left">
                    <Button
                        variant="ghost"
                        size="icon"
                        active={activeTool === 'highlight'}
                        className={`annotation-tool-button ${
                            activeTool === 'highlight' ? 'annotation-tool-active' : ''
                        }`}
                        onClick={() => setActiveTool('highlight')}
                        aria-label="Highlighter"
                    >
                        <Highlighter size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
                <Tooltip text="Pen (P)" position="left">
                    <Button
                        variant="ghost"
                        size="icon"
                        active={activeTool === 'pen'}
                        className={`annotation-tool-button ${
                            activeTool === 'pen' ? 'annotation-tool-active' : ''
                        }`}
                        onClick={() => setActiveTool('pen')}
                        aria-label="Pen"
                    >
                        <PenLine size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
                <Tooltip text="Underline (U)" position="left">
                    <Button
                        variant="ghost"
                        size="icon"
                        active={activeTool === 'underline'}
                        className={`annotation-tool-button ${
                            activeTool === 'underline' ? 'annotation-tool-active' : ''
                        }`}
                        onClick={() => setActiveTool('underline')}
                        aria-label="Underline"
                    >
                        <Underline size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
                <Tooltip text="Sticky note (N)" position="left">
                    <Button
                        variant="ghost"
                        size="icon"
                        active={activeTool === 'note'}
                        className={`annotation-tool-button ${
                            activeTool === 'note' ? 'annotation-tool-active' : ''
                        }`}
                        onClick={() => setActiveTool('note')}
                        aria-label="Sticky note"
                    >
                        <NotebookPen size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
                <Tooltip text="Eraser (E)" position="left">
                    <Button
                        variant="ghost"
                        size="icon"
                        active={activeTool === 'eraser'}
                        className={`annotation-tool-button ${
                            activeTool === 'eraser' ? 'annotation-tool-active' : ''
                        }`}
                        onClick={() => setActiveTool('eraser')}
                        aria-label="Eraser"
                    >
                        <Eraser size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
            </div>

            <div className="annotation-toolbar-divider" />

            <div className="annotation-toolbar-section">
                <ColorPalette activeColor={activeColor} onSelect={setActiveColor} />

                {activeTool === 'pen' && (
                    <div className="annotation-stroke-width">
                        <button
                            type="button"
                            className={`annotation-stroke-button ${
                                strokeWidth === 2 ? 'annotation-stroke-active' : ''
                            }`}
                            onClick={() => setStrokeWidth(2)}
                            aria-label="Thin stroke"
                        />
                        <button
                            type="button"
                            className={`annotation-stroke-button ${
                                strokeWidth === 4 ? 'annotation-stroke-active' : ''
                            }`}
                            onClick={() => setStrokeWidth(4)}
                            aria-label="Medium stroke"
                        />
                        <button
                            type="button"
                            className={`annotation-stroke-button ${
                                strokeWidth === 6 ? 'annotation-stroke-active' : ''
                            }`}
                            onClick={() => setStrokeWidth(6)}
                            aria-label="Thick stroke"
                        />
                    </div>
                )}
            </div>

            <div className="annotation-toolbar-divider" />

            <div className="annotation-toolbar-section">
                <Tooltip text="Undo (Ctrl+Z)" position="left">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="annotation-tool-button"
                        onClick={undo}
                        disabled={!canUndo}
                        aria-label="Undo"
                    >
                        <Undo2 size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
                <Tooltip text="Clear annotations" position="left">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="annotation-tool-button"
                        onClick={handleClear}
                        aria-label="Clear annotations"
                    >
                        <Trash2 size={18} strokeWidth={1.5} />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
}
