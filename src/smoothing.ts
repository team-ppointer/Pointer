import { Skia, SkPath } from "@shopify/react-native-skia";
import type { ReadonlyPoint, ReadonlyStrokeSample, WritingFeelConfig } from "./model/drawingTypes";
import { resolveDynamicStrokeWidth, DEFAULT_WRITING_FEEL_CONFIG } from "./model/writingFeel";

/** Minimum knot interval below which we fall back to uniform 1/6 control points */
const CENTRIPETAL_EPSILON = 1e-6;

const isValidPoint = (point: ReadonlyPoint): boolean =>
  Number.isFinite(point.x) && Number.isFinite(point.y);

/**
 * Compute cubic Bézier control points for a centripetal Catmull-Rom
 * segment p1 → p2, given surrounding context points p0 and p3.
 *
 * Uses Barry-Goldman tangent formulation with α = 0.5 (centripetal).
 * Falls back to uniform 1/6 ratio when any knot interval is degenerate.
 */
export function centripetalControlPoints(
  p0: ReadonlyPoint,
  p1: ReadonlyPoint,
  p2: ReadonlyPoint,
  p3: ReadonlyPoint,
): { cp1x: number; cp1y: number; cp2x: number; cp2y: number } {
  // Knot intervals: |P_i - P_{i-1}|^α where α = 0.5 → (dx²+dy²)^(α/2) = (dx²+dy²)^0.25
  const d01 = Math.pow(
    (p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y),
    0.25,
  );
  const d12 = Math.pow(
    (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y),
    0.25,
  );
  const d23 = Math.pow(
    (p3.x - p2.x) * (p3.x - p2.x) + (p3.y - p2.y) * (p3.y - p2.y),
    0.25,
  );

  // Fall back to uniform 1/6 when any interval is degenerate
  if (d01 < CENTRIPETAL_EPSILON || d12 < CENTRIPETAL_EPSILON || d23 < CENTRIPETAL_EPSILON) {
    return {
      cp1x: p1.x + (p2.x - p0.x) / 6,
      cp1y: p1.y + (p2.y - p0.y) / 6,
      cp2x: p2.x - (p3.x - p1.x) / 6,
      cp2y: p2.y - (p3.y - p1.y) / 6,
    };
  }

  // Tangents via Barry-Goldman formulation
  const d01_d12 = d01 + d12;
  const d12_d23 = d12 + d23;

  const v1x = (p1.x - p0.x) / d01 - (p2.x - p0.x) / d01_d12 + (p2.x - p1.x) / d12;
  const v1y = (p1.y - p0.y) / d01 - (p2.y - p0.y) / d01_d12 + (p2.y - p1.y) / d12;

  const v2x = (p2.x - p1.x) / d12 - (p3.x - p1.x) / d12_d23 + (p3.x - p2.x) / d23;
  const v2y = (p2.y - p1.y) / d12 - (p3.y - p1.y) / d12_d23 + (p3.y - p2.y) / d23;

  const scale = d12 / 3;
  return {
    cp1x: p1.x + v1x * scale,
    cp1y: p1.y + v1y * scale,
    cp2x: p2.x - v2x * scale,
    cp2y: p2.y - v2y * scale,
  };
}

export function buildSmoothPath(points: ReadonlyArray<ReadonlyPoint>): SkPath {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;

  const firstPoint = points[0];
  if (!isValidPoint(firstPoint)) {
    return path;
  }

  path.moveTo(firstPoint.x, firstPoint.y);

  if (points.length === 1) {
    return path;
  }

  if (points.length < 3) {
    const secondPoint = points[1];
    if (isValidPoint(secondPoint)) {
      path.lineTo(secondPoint.x, secondPoint.y);
    }
    return path;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const previous = i > 0
      ? points[i - 1]
      : { x: 2 * current.x - next.x, y: 2 * current.y - next.y };
    const nextNext = i + 2 < points.length
      ? points[i + 2]
      : { x: 2 * next.x - current.x, y: 2 * next.y - current.y };

    if (
      !isValidPoint(previous) ||
      !isValidPoint(current) ||
      !isValidPoint(next) ||
      !isValidPoint(nextNext)
    ) {
      continue;
    }

    const { cp1x, cp1y, cp2x, cp2y } = centripetalControlPoints(previous, current, next, nextNext);

    path.cubicTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
  }

  return path;
}

function normalAt(
  p0: ReadonlyPoint,
  p1: ReadonlyPoint,
): { nx: number; ny: number } {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  return { nx: -dy / len, ny: dx / len };
}

function sampleWidthAt(
  samples: ReadonlyArray<ReadonlyStrokeSample>,
  index: number,
  config: WritingFeelConfig,
  fallbackWidth: number,
): number {
  if (index < 0 || index >= samples.length) return fallbackWidth;
  return resolveDynamicStrokeWidth(samples[index], config);
}

export function buildVariableWidthPath(
  samples: ReadonlyArray<ReadonlyStrokeSample>,
  config: WritingFeelConfig = DEFAULT_WRITING_FEEL_CONFIG,
  fallbackWidth = 2.5,
): SkPath {
  const path = Skia.Path.Make();
  if (samples.length === 0) return path;

  if (samples.length === 1) {
    const w = sampleWidthAt(samples, 0, config, fallbackWidth);
    const r = w / 2;
    path.addCircle(samples[0].x, samples[0].y, r);
    return path;
  }

  // Build left and right edges
  const leftEdge: { x: number; y: number }[] = [];
  const rightEdge: { x: number; y: number }[] = [];

  // Track last valid normal to propagate through coincident samples
  let lastNx = 0;
  let lastNy = 1;

  for (let i = 0; i < samples.length; i++) {
    const curr = samples[i];
    const prev = i > 0 ? samples[i - 1] : curr;
    const next = i < samples.length - 1 ? samples[i + 1] : curr;

    let { nx, ny } = normalAt(prev, next);
    if (nx === 0 && ny === 0) {
      // Coincident neighbors — reuse last valid normal to avoid edge pinch
      nx = lastNx;
      ny = lastNy;
    } else {
      lastNx = nx;
      lastNy = ny;
    }

    const halfW = sampleWidthAt(samples, i, config, fallbackWidth) / 2;

    leftEdge.push({ x: curr.x + nx * halfW, y: curr.y + ny * halfW });
    rightEdge.push({ x: curr.x - nx * halfW, y: curr.y - ny * halfW });
  }

  // Draw forward along left edge, then backward along right edge
  path.moveTo(leftEdge[0].x, leftEdge[0].y);
  for (let i = 1; i < leftEdge.length; i++) {
    path.lineTo(leftEdge[i].x, leftEdge[i].y);
  }

  // Connect to right edge at the end
  const lastRight = rightEdge[rightEdge.length - 1];
  path.lineTo(lastRight.x, lastRight.y);

  // Trace right edge backward
  for (let i = rightEdge.length - 2; i >= 0; i--) {
    path.lineTo(rightEdge[i].x, rightEdge[i].y);
  }

  path.close();
  return path;
}
