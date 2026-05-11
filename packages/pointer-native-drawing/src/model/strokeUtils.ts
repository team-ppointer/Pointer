import { type Point, type Stroke, type StrokeBounds } from './drawingTypes';

// ── Deep copy ──

export const deepCopyStrokes = (strokes: Stroke[]): Stroke[] =>
  strokes.map((stroke) => ({
    points: stroke.points.map((p) => ({ ...p })),
    color: stroke.color,
    width: stroke.width,
  }));

// ── 배열 유틸 ──

export const safeMax = (arr: number[], fallback = 0): number =>
  arr.length > 0 ? arr.reduce((max, v) => (v > max ? v : max), arr[0]) : fallback;

// ── Bounds 계산 ──

/** single-pass O(n)으로 stroke의 AABB를 계산. MAT-360 지우개 히트 테스트 최적화 기반. */
export function computeStrokeBounds(points: readonly Point[]): StrokeBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  return { minX, minY, maxX, maxY };
}
