'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePdfStore } from '@/store/pdfStore';
import { useAnnotationStore } from '../store/annotationStore';
import { useAnnotationCanvas } from '../hooks/useAnnotationCanvas';
import { useAnnotationPersistence } from '../hooks/useAnnotationPersistence';
import { useHighlighter } from '../hooks/useHighlighter';
import { usePenTool } from '../hooks/usePenTool';
import { useUnderlineTool } from '../hooks/useUnderlineTool';
import { useEraserTool } from '../hooks/useEraserTool';
import { useStickyNote } from '../hooks/useStickyNote';
import { drawAnnotations } from '../utils/canvasHelpers';
import type { Annotation, NoteAnnotation } from '../types';
import StickyNoteIcon from './StickyNoteIcon';
import StickyNotePopup from './StickyNotePopup';
import EraserCursor from './EraserCursor';

const EMPTY_ANNOTATIONS: Annotation[] = [];

interface AnnotationCanvasProps {
    pdfCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function AnnotationCanvas({ pdfCanvasRef }: AnnotationCanvasProps) {
    const fileName = usePdfStore((s) => s.fileName);
    const bookId = usePdfStore((s) => s.bookId);
    const currentPage = usePdfStore((s) => s.currentPage);
    const zoom = usePdfStore((s) => s.zoom);
    const baseScale = usePdfStore((s) => s.baseScale);

    const activeTool = useAnnotationStore((s) => s.activeTool);
    const activeColor = useAnnotationStore((s) => s.activeColor);
    const strokeWidth = useAnnotationStore((s) => s.strokeWidth);
    const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
    const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);
    const removeAnnotation = useAnnotationStore((s) => s.removeAnnotation);

    const { annotationCanvasRef, metrics, getCanvasPoint, syncSize } =
        useAnnotationCanvas(pdfCanvasRef);

    const storedAnnotations = useAnnotationStore(
        (s) => s.annotations[`page_${currentPage}`],
    );
    const annotations = storedAnnotations || EMPTY_ANNOTATIONS;
    const annotationsRef = useRef<Annotation[]>(annotations);

    useEffect(() => {
        annotationsRef.current = annotations;
    }, [annotations]);

    useAnnotationPersistence(fileName, currentPage, bookId);

    useEffect(() => {
        syncSize();
    }, [currentPage, zoom, baseScale, syncSize]);

    const redraw = useCallback(() => {
        const canvas = annotationCanvasRef.current;
        if (!canvas || !metrics.width || !metrics.height) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawAnnotations(ctx, annotationsRef.current, metrics.width, metrics.height);
    }, [annotationCanvasRef, metrics.width, metrics.height]);

    useEffect(() => {
        redraw();
    }, [annotations, metrics, redraw]);

    useHighlighter({
        active: activeTool === 'highlight',
        page: currentPage,
        color: activeColor,
        canvasRef: annotationCanvasRef,
        getCanvasPoint,
        annotationsRef,
        addAnnotation,
        redraw,
    });

    usePenTool({
        active: activeTool === 'pen',
        page: currentPage,
        color: activeColor,
        strokeWidth,
        canvasRef: annotationCanvasRef,
        getCanvasPoint,
        annotationsRef,
        addAnnotation,
        redraw,
    });

    useUnderlineTool({
        active: activeTool === 'underline',
        page: currentPage,
        color: activeColor,
        canvasRef: annotationCanvasRef,
        getCanvasPoint,
        annotationsRef,
        addAnnotation,
        redraw,
    });

    const { cursor, radius } = useEraserTool({
        active: activeTool === 'eraser',
        page: currentPage,
        canvasRef: annotationCanvasRef,
        getCanvasPoint,
        annotationsRef,
        removeAnnotation,
        redraw,
    });

    const {
        editingId,
        draftText,
        popupPosition,
        setDraftText,
        openExistingNote,
        saveNote,
        deleteNote,
        closeEditor,
    } = useStickyNote({
        active: activeTool === 'note',
        page: currentPage,
        color: activeColor,
        canvasRef: annotationCanvasRef,
        getCanvasPoint,
        annotationsRef,
        addAnnotation,
        updateAnnotation,
        removeAnnotation,
    });

    const canvasPointerEvents =
        activeTool === 'cursor' || editingId ? 'none' : 'auto';

    const notes = useMemo(
        () => annotations.filter((item) => item.tool === 'note') as NoteAnnotation[],
        [annotations],
    );

    const notePositions = useMemo(() => {
        if (!metrics.cssWidth || !metrics.cssHeight) return [];
        return notes.map((note) => ({
            note,
            x: note.x * metrics.cssWidth,
            y: note.y * metrics.cssHeight,
        }));
    }, [notes, metrics.cssWidth, metrics.cssHeight]);

    return (
        <div className="annotation-layer">
            <canvas
                ref={annotationCanvasRef}
                className={`annotation-canvas annotation-tool-${activeTool}`}
                style={{ pointerEvents: canvasPointerEvents }}
            />

            {notePositions.map(({ note, x, y }) => (
                <StickyNoteIcon
                    key={note.id}
                    note={note}
                    x={x}
                    y={y}
                    onClick={openExistingNote}
                />
            ))}

            {editingId && popupPosition && (
                <StickyNotePopup
                    x={popupPosition.x + 12}
                    y={popupPosition.y + 12}
                    value={draftText}
                    onChange={setDraftText}
                    onSave={saveNote}
                    onDelete={deleteNote}
                    onClose={closeEditor}
                />
            )}

            <EraserCursor
                x={cursor?.x || 0}
                y={cursor?.y || 0}
                radius={radius}
                visible={activeTool === 'eraser' && !!cursor}
            />
        </div>
    );
}

