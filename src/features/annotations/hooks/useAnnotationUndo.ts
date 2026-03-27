import { useCallback, useEffect, useMemo } from 'react';
import { useAnnotationStore } from '../store/annotationStore';
import type { AnnotationTool } from '../types';

const EMPTY_STACK: string[] = [];

const TOOL_SHORTCUTS: Record<string, AnnotationTool> = {
    h: 'highlight',
    p: 'pen',
    u: 'underline',
    n: 'note',
    e: 'eraser',
};

export function useAnnotationUndo(page: number) {
    const undoLastAnnotation = useAnnotationStore((s) => s.undoLastAnnotation);
    const setActiveTool = useAnnotationStore((s) => s.setActiveTool);
    const undoStack = useAnnotationStore((s) => s.undoStacks[`page_${page}`]);

    const stack = undoStack || EMPTY_STACK;

    const canUndo = useMemo(() => stack.length > 0, [stack.length]);

    const undo = useCallback(() => {
        undoLastAnnotation(page);
    }, [undoLastAnnotation, page]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                undo();
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                setActiveTool('cursor');
                return;
            }

            const shortcut = TOOL_SHORTCUTS[event.key.toLowerCase()];
            if (shortcut) {
                event.preventDefault();
                setActiveTool(shortcut);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, setActiveTool]);

    return { undo, canUndo };
}
