import { useCallback, useEffect, useState } from 'react';
import type { Annotation, NoteAnnotation } from '../types';
import { createAnnotationId } from '../utils/createId';

interface UseStickyNoteProps {
    active: boolean;
    page: number;
    color: string;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    getCanvasPoint: (clientX: number, clientY: number) => {
        x: number;
        y: number;
        nx: number;
        ny: number;
        cssX: number;
        cssY: number;
    } | null;
    annotationsRef: React.MutableRefObject<Annotation[]>;
    addAnnotation: (annotation: NoteAnnotation) => void;
    updateAnnotation: (annotation: NoteAnnotation) => void;
    removeAnnotation: (page: number, id: string) => void;
}

export function useStickyNote({
    active,
    page,
    color,
    canvasRef,
    getCanvasPoint,
    annotationsRef,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
}: UseStickyNoteProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftText, setDraftText] = useState('');
    const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

    const openEditor = useCallback(
        (note: NoteAnnotation, position: { x: number; y: number }) => {
            setEditingId(note.id);
            setDraftText(note.text || '');
            setPopupPosition(position);
        },
        [],
    );

    const closeEditor = useCallback(() => {
        setEditingId(null);
        setPopupPosition(null);
    }, []);

    const saveNote = useCallback(() => {
        if (!editingId) return;
        const note = annotationsRef.current.find(
            (annotation) => annotation.tool === 'note' && annotation.id === editingId,
        ) as NoteAnnotation | undefined;
        if (!note) {
            closeEditor();
            return;
        }
        updateAnnotation({ ...note, text: draftText });
        closeEditor();
    }, [editingId, draftText, updateAnnotation, closeEditor, annotationsRef]);

    const deleteNote = useCallback(() => {
        if (!editingId) return;
        removeAnnotation(page, editingId);
        closeEditor();
    }, [editingId, page, removeAnnotation, closeEditor]);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handlePlace = (clientX: number, clientY: number) => {
            const point = getCanvasPoint(clientX, clientY);
            if (!point) return;
            const note: NoteAnnotation = {
                id: createAnnotationId(),
                tool: 'note',
                page,
                color,
                createdAt: Date.now(),
                x: point.nx,
                y: point.ny,
                text: '',
            };
            addAnnotation(note);
            openEditor(note, { x: point.cssX, y: point.cssY });
        };

        const handleMouseDown = (event: MouseEvent) => {
            event.preventDefault();
            handlePlace(event.clientX, event.clientY);
        };

        const handleTouchStart = (event: TouchEvent) => {
            if (!event.touches[0]) return;
            event.preventDefault();
            handlePlace(event.touches[0].clientX, event.touches[0].clientY);
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('touchstart', handleTouchStart);
        };
    }, [active, page, color, canvasRef, getCanvasPoint, addAnnotation, openEditor]);

    const openExistingNote = useCallback(
        (note: NoteAnnotation, position: { x: number; y: number }) => {
            openEditor(note, position);
        },
        [openEditor],
    );

    return {
        editingId,
        draftText,
        popupPosition,
        setDraftText,
        openExistingNote,
        saveNote,
        deleteNote,
        closeEditor,
    };
}
