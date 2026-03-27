export const ANNOTATION_COLORS = [
    '#FFE066',
    '#A8E6A3',
    '#FFB3C6',
    '#A3D4FF',
    '#FFD0A0',
] as const;

export type AnnotationColor = typeof ANNOTATION_COLORS[number];

export type AnnotationTool =
    | 'cursor'
    | 'highlight'
    | 'pen'
    | 'underline'
    | 'note'
    | 'eraser';

export interface Point {
    x: number;
    y: number;
}

export interface NormalizedPoint {
    x: number;
    y: number;
}

export interface BaseAnnotation {
    id: string;
    tool: 'highlight' | 'pen' | 'underline' | 'note';
    page: number;
    color: AnnotationColor;
    createdAt: number;
}

export interface HighlightAnnotation extends BaseAnnotation {
    tool: 'highlight';
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface UnderlineAnnotation extends BaseAnnotation {
    tool: 'underline';
    x: number;
    y: number;
    width: number;
}

export interface PenAnnotation extends BaseAnnotation {
    tool: 'pen';
    points: NormalizedPoint[];
    width: number;
}

export interface NoteAnnotation extends BaseAnnotation {
    tool: 'note';
    x: number;
    y: number;
    text: string;
}

export type Annotation =
    | HighlightAnnotation
    | UnderlineAnnotation
    | PenAnnotation
    | NoteAnnotation;

export type AnnotationsByPage = Record<string, Annotation[]>;
