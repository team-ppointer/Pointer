import type { Point, Stroke, StrokeBounds } from './drawingTypes';

/**
 * Freeze a stroke and its nested arrays to enforce immutability.
 * Only active in __DEV__ builds; production builds eliminate this via dead code elimination.
 */
export const freezeStroke = (stroke: Stroke): Stroke => {
  if (__DEV__) {
    Object.freeze(stroke);
    Object.freeze(stroke.points);
    if (stroke.samples) Object.freeze(stroke.samples);
  }
  return stroke;
};

export const MIN_RENDERABLE_STROKE_WIDTH = 1.2;
export const DEFAULT_MAX_POINT_GAP = 0.95;

export const deepCopyStrokes = (strokes: Stroke[]): Stroke[] =>
  strokes.map((stroke) => ({
    points: stroke.points instanceof Float64Array
      ? Float64Array.from(stroke.points)
      : stroke.points.map((p) => ({ ...p })),
    color: stroke.color,
    width: stroke.width,
    ...(stroke.opacity !== undefined ? { opacity: stroke.opacity } : {}),
    ...(stroke.strokeCap !== undefined ? { strokeCap: stroke.strokeCap } : {}),
    ...(stroke.samples !== undefined
      ? {
          samples: stroke.samples instanceof Float64Array
            ? Float64Array.from(stroke.samples)
            : stroke.samples.map((s) => ({ ...s })),
        }
      : {}),
  }));

export const getMaxYFromStrokes = (strokes: Stroke[]): number => {
  let max = 0;
  let hasPoint = false;

  for (let i = 0; i < strokes.length; i++) {
    const points = strokes[i].points;
    if (points instanceof Float64Array) {
      for (let j = 1; j < points.length; j += 2) {
        if (!hasPoint || points[j] > max) { max = points[j]; hasPoint = true; }
      }
    } else {
      for (let j = 0; j < points.length; j++) {
        const y = points[j].y;
        if (!hasPoint || y > max) { max = y; hasPoint = true; }
      }
    }
  }

  return hasPoint ? max : 0;
};

export const getMaxYFromPoints = (points: Point[] | Float64Array): number => {
  let max = 0;
  let hasPoint = false;

  if (points instanceof Float64Array) {
    for (let i = 1; i < points.length; i += 2) {
      if (!hasPoint || points[i] > max) { max = points[i]; hasPoint = true; }
    }
  } else {
    for (let i = 0; i < points.length; i++) {
      const y = points[i].y;
      if (!hasPoint || y > max) { max = y; hasPoint = true; }
    }
  }

  return hasPoint ? max : 0;
};

export const getStrokeBounds = (points: Point[] | Float64Array): StrokeBounds => {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  if (points instanceof Float64Array) {
    let minX = points[0], minY = points[1], maxX = points[0], maxY = points[1];
    for (let i = 2; i < points.length; i += 2) {
      const x = points[i], y = points[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return { minX, minY, maxX, maxY };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    const { x, y } = points[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY };
};

export const isPointNearBounds = (
  x: number,
  y: number,
  radius: number,
  bounds: StrokeBounds
): boolean =>
  x >= bounds.minX - radius &&
  x <= bounds.maxX + radius &&
  y >= bounds.minY - radius &&
  y <= bounds.maxY + radius;

/**
 * Squared distance from point (px, py) to the closest point on segment (ax, ay)-(bx, by).
 * Returns squared distance to avoid sqrt in hot loops.
 */
export const pointToSegmentDistanceSquared = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number => {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSquared = abx * abx + aby * aby;

  if (lengthSquared === 0) {
    // Degenerate segment (a === b), fall back to point distance
    const dx = px - ax;
    const dy = py - ay;
    return dx * dx + dy * dy;
  }

  // Project point onto the segment, clamped to [0, 1]
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSquared));
  const projX = ax + t * abx;
  const projY = ay + t * aby;
  const dx = px - projX;
  const dy = py - projY;
  return dx * dx + dy * dy;
};

export const normalizeStrokeWidth = (width: number): number =>
  Math.max(MIN_RENDERABLE_STROKE_WIDTH, width);

export const resolveMaxPointGap = (activeWidth: number): number => {
  const normalizedWidth = normalizeStrokeWidth(activeWidth);
  if (normalizedWidth <= 1.4) {
    return 0.5;
  }
  if (normalizedWidth <= 2.2) {
    return 0.72;
  }
  return DEFAULT_MAX_POINT_GAP;
};

export const appendPointWithInterpolation = (
  points: Point[],
  nextPoint: Point,
  maxGap: number
): void => {
  if (points.length === 0) {
    points.push(nextPoint);
    return;
  }

  const lastPoint = points[points.length - 1];
  const dx = nextPoint.x - lastPoint.x;
  const dy = nextPoint.y - lastPoint.y;
  const distance = Math.hypot(dx, dy);

  if (!Number.isFinite(distance) || distance === 0) {
    return;
  }

  if (distance <= maxGap) {
    points.push(nextPoint);
    return;
  }

  const steps = Math.ceil(distance / maxGap);
  for (let i = 1; i < steps; i++) {
    const ratio = i / steps;
    points.push({
      x: lastPoint.x + dx * ratio,
      y: lastPoint.y + dy * ratio,
    });
  }

  points.push(nextPoint);
};
