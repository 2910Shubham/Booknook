import { create } from 'zustand';
import type { Annotation, AnnotationColor, AnnotationTool, AnnotationsByPage } from '../types';

interface AnnotationState {
    annotations: AnnotationsByPage;
    activeTool: AnnotationTool;
    activeColor: AnnotationColor;
    strokeWidth: number;
    undoStacks: Record<string, string[]>;

    addAnnotation: (annotation: Annotation) => void;
    updateAnnotation: (annotation: Annotation) => void;
    removeAnnotation: (page: number, id: string) => void;
    loadPageAnnotations: (page: number, annotations: Annotation[]) => void;
    clearPageAnnotations: (page: number) => void;
    clearAllAnnotations: () => void;
    undoLastAnnotation: (page: number) => void;

    setActiveTool: (tool: AnnotationTool) => void;
    setActiveColor: (color: AnnotationColor) => void;
    setStrokeWidth: (width: number) => void;
}

const DEFAULT_COLOR: AnnotationColor = '#FFE066';

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
    annotations: {},
    activeTool: 'cursor',
    activeColor: DEFAULT_COLOR,
    strokeWidth: 2,
    undoStacks: {},

    addAnnotation: (annotation) =>
        set((state) => {
            const pageKey = `page_${annotation.page}`;
            const next = {
                ...state.annotations,
                [pageKey]: [...(state.annotations[pageKey] || []), annotation],
            };
            const stack = state.undoStacks[pageKey] || [];
            const nextStack = [...stack, annotation.id].slice(-20);

            return {
                annotations: next,
                undoStacks: { ...state.undoStacks, [pageKey]: nextStack },
            };
        }),

    updateAnnotation: (annotation) =>
        set((state) => {
            const pageKey = `page_${annotation.page}`;
            const pageAnnotations = state.annotations[pageKey] || [];
            const nextPage = pageAnnotations.map((item) =>
                item.id === annotation.id ? annotation : item,
            );
            return {
                annotations: {
                    ...state.annotations,
                    [pageKey]: nextPage,
                },
            };
        }),

    removeAnnotation: (page, id) =>
        set((state) => {
            const pageKey = `page_${page}`;
            const pageAnnotations = state.annotations[pageKey] || [];
            const nextPage = pageAnnotations.filter((item) => item.id !== id);
            const nextStack = (state.undoStacks[pageKey] || []).filter(
                (entry) => entry !== id,
            );
            return {
                annotations: {
                    ...state.annotations,
                    [pageKey]: nextPage,
                },
                undoStacks: { ...state.undoStacks, [pageKey]: nextStack },
            };
        }),

    loadPageAnnotations: (page, annotations) =>
        set((state) => {
            const pageKey = `page_${page}`;
            const ids = annotations.map((item) => item.id).slice(-20);
            return {
                annotations: { ...state.annotations, [pageKey]: annotations },
                undoStacks: { ...state.undoStacks, [pageKey]: ids },
            };
        }),

    clearPageAnnotations: (page) =>
        set((state) => {
            const pageKey = `page_${page}`;
            return {
                annotations: { ...state.annotations, [pageKey]: [] },
                undoStacks: { ...state.undoStacks, [pageKey]: [] },
            };
        }),

    clearAllAnnotations: () => set({ annotations: {}, undoStacks: {} }),

    undoLastAnnotation: (page) => {
        const { annotations, undoStacks } = get();
        const pageKey = `page_${page}`;
        const stack = undoStacks[pageKey] || [];
        const lastId = stack[stack.length - 1];
        if (!lastId) return;
        const pageAnnotations = annotations[pageKey] || [];
        const nextPage = pageAnnotations.filter((item) => item.id !== lastId);
        const nextStack = stack.slice(0, -1);
        set({
            annotations: { ...annotations, [pageKey]: nextPage },
            undoStacks: { ...undoStacks, [pageKey]: nextStack },
        });
    },

    setActiveTool: (activeTool) => set({ activeTool }),
    setActiveColor: (activeColor) => set({ activeColor }),
    setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
}));
