import type { Annotation, PenAnnotation } from '../types';
import { smoothPoints } from './bezierSmooth';

const HIGHLIGHT_OPACITY = 0.35;
const UNDERLINE_HEIGHT = 3;

function toCanvasX(value: number, width: number) {
    return value * width;
}

function toCanvasY(value: number, height: number) {
    return value * height;
}

export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);
}

function drawHighlight(
    ctx: CanvasRenderingContext2D,
    annotation: Extract<Annotation, { tool: 'highlight' }>,
    width: number,
    height: number,
) {
    const x = toCanvasX(annotation.x, width);
    const y = toCanvasY(annotation.y, height);
    const w = toCanvasX(annotation.width, width);
    const h = toCanvasY(annotation.height, height);
    ctx.save();
    ctx.globalAlpha = HIGHLIGHT_OPACITY;
    ctx.fillStyle = annotation.color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

function drawUnderline(
    ctx: CanvasRenderingContext2D,
    annotation: Extract<Annotation, { tool: 'underline' }>,
    width: number,
    height: number,
) {
    const x = toCanvasX(annotation.x, width);
    const y = toCanvasY(annotation.y, height);
    const w = toCanvasX(annotation.width, width);
    ctx.save();
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = UNDERLINE_HEIGHT;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
    ctx.restore();
}

function drawPen(
    ctx: CanvasRenderingContext2D,
    annotation: PenAnnotation,
    width: number,
    height: number,
) {
    if (annotation.points.length === 0) return;
    const points = annotation.points.map((point) => ({
        x: toCanvasX(point.x, width),
        y: toCanvasY(point.y, height),
    }));
    const smoothed = smoothPoints(points);

    ctx.save();
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(smoothed[0].x, smoothed[0].y);

    for (let i = 1; i < smoothed.length; i += 1) {
        const prev = smoothed[i - 1];
        const current = smoothed[i];
        const midX = (prev.x + current.x) / 2;
        const midY = (prev.y + current.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }

    ctx.stroke();
    ctx.restore();
}

export function drawAnnotations(
    ctx: CanvasRenderingContext2D,
    annotations: Annotation[],
    width: number,
    height: number,
) {
    clearCanvas(ctx, width, height);

    annotations.forEach((annotation) => {
        switch (annotation.tool) {
            case 'highlight':
                drawHighlight(ctx, annotation, width, height);
                break;
            case 'underline':
                drawUnderline(ctx, annotation, width, height);
                break;
            case 'pen':
                drawPen(ctx, annotation, width, height);
                break;
            case 'note':
                break;
            default:
                break;
        }
    });
}

export function drawHighlightPreview(
    ctx: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    width: number,
    height: number,
) {
    ctx.save();
    ctx.globalAlpha = HIGHLIGHT_OPACITY;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
}

export function drawUnderlinePreview(
    ctx: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    width: number,
) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = UNDERLINE_HEIGHT;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
    ctx.restore();
}

export function drawPenPreview(
    ctx: CanvasRenderingContext2D,
    color: string,
    points: { x: number; y: number }[],
    width: number,
) {
    if (points.length === 0) return;
    const smoothed = smoothPoints(points);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(smoothed[0].x, smoothed[0].y);

    for (let i = 1; i < smoothed.length; i += 1) {
        const prev = smoothed[i - 1];
        const current = smoothed[i];
        const midX = (prev.x + current.x) / 2;
        const midY = (prev.y + current.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }

    ctx.stroke();
    ctx.restore();
}
