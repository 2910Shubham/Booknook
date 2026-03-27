import type { Point } from '../types';

export function smoothPoints(points: Point[]): Point[] {
    if (points.length <= 2) return points;

    return points.map((point, index) => {
        const start = Math.max(0, index - 1);
        const end = Math.min(points.length - 1, index + 1);
        const window = points.slice(start, end + 1);
        const total = window.reduce(
            (acc, item) => ({ x: acc.x + item.x, y: acc.y + item.y }),
            { x: 0, y: 0 },
        );
        return {
            x: total.x / window.length,
            y: total.y / window.length,
        };
    });
}
