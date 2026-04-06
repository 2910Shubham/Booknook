export const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const getMidPoint = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};

export const drawSmoothLine = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
  if (points.length < 3) {
    if (points.length === 2) {
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
    }
    return;
  }

  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length - 2; i++) {
    const mid = getMidPoint(points[i], points[i + 1]);
    ctx.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y);
  }

  // For the last 2 points
  ctx.quadraticCurveTo(
    points[points.length - 2].x,
    points[points.length - 2].y,
    points[points.length - 1].x,
    points[points.length - 1].y
  );
  
  ctx.stroke();
};