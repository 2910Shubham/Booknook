import type { Annotation, PenAnnotation } from '../types';

function toCanvasX(value: number, width: number) {
    return value * width;
}

function toCanvasY(value: number, height: number) {
    return value * height;
}

function distance(ax: number, ay: number, bx: number, by: number) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.hypot(dx, dy);
}

function distanceToSegment(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
) {
    const abx = bx - ax;
    const aby = by - ay;
    const apx = px - ax;
    const apy = py - ay;
    const abLenSq = abx * abx + aby * aby;
    const t = abLenSq === 0 ? 0 : (apx * abx + apy * aby) / abLenSq;
    const clamped = Math.max(0, Math.min(1, t));
    const closestX = ax + clamped * abx;
    const closestY = ay + clamped * aby;
    return distance(px, py, closestX, closestY);
}

function circleIntersectsRect(
    cx: number,
    cy: number,
    radius: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    return distance(cx, cy, closestX, closestY) <= radius;
}

function hitTestPen(
    annotation: PenAnnotation,
    cx: number,
    cy: number,
    radius: number,
    width: number,
    height: number,
) {
    const points = annotation.points.map((point) => ({
        x: toCanvasX(point.x, width),
        y: toCanvasY(point.y, height),
    }));

    if (points.length === 1) {
        return distance(cx, cy, points[0].x, points[0].y) <= radius + annotation.width;
    }

    for (let i = 1; i < points.length; i += 1) {
        const prev = points[i - 1];
        const current = points[i];
        const dist = distanceToSegment(cx, cy, prev.x, prev.y, current.x, current.y);
        if (dist <= radius + annotation.width) {
            return true;
        }
    }

    return false;
}

export function hitTestAnnotation(
    annotation: Annotation,
    cx: number,
    cy: number,
    radius: number,
    width: number,
    height: number,
) {
    switch (annotation.tool) {
        case 'highlight': {
            const x = toCanvasX(annotation.x, width);
            const y = toCanvasY(annotation.y, height);
            const w = toCanvasX(annotation.width, width);
            const h = toCanvasY(annotation.height, height);
            return circleIntersectsRect(cx, cy, radius, x, y, w, h);
        }
        case 'underline': {
            const x = toCanvasX(annotation.x, width);
            const y = toCanvasY(annotation.y, height) - 2;
            const w = toCanvasX(annotation.width, width);
            return circleIntersectsRect(cx, cy, radius, x, y, w, 6);
        }
        case 'pen':
            return hitTestPen(annotation, cx, cy, radius, width, height);
        case 'note': {
            const x = toCanvasX(annotation.x, width) - 8;
            const y = toCanvasY(annotation.y, height) - 8;
            return circleIntersectsRect(cx, cy, radius, x, y, 16, 16);
        }
        default:
            return false;
    }
}

export function findHitAnnotation(
    annotations: Annotation[],
    cx: number,
    cy: number,
    radius: number,
    width: number,
    height: number,
) {
    for (let i = annotations.length - 1; i >= 0; i -= 1) {
        const annotation = annotations[i];
        if (hitTestAnnotation(annotation, cx, cy, radius, width, height)) {
            return annotation;
        }
    }
    return null;
}
