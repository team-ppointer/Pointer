import { Skia, type SkPath } from '@shopify/react-native-skia';

import { type Point } from './model/drawingTypes';

/** Minimum knot interval below which we fall back to uniform 1/6 control points */
const CENTRIPETAL_EPSILON = 1e-6;

const isValidPoint = (p: Point): boolean => Number.isFinite(p.x) && Number.isFinite(p.y);

// ---------------------------------------------------------------------------
// Catmull-Rom control points (centripetal parameterization)
// Mutable singleton — internal only. per-call allocation 회피, single-threaded JS에서 안전.
// ---------------------------------------------------------------------------

const _cpOut = { cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0 };

function centripetalControlPointsMut(p0: Point, p1: Point, p2: Point, p3: Point): typeof _cpOut {
  const d01 = Math.sqrt(Math.sqrt((p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y)));
  const d12 = Math.sqrt(Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y)));
  const d23 = Math.sqrt(Math.sqrt((p3.x - p2.x) * (p3.x - p2.x) + (p3.y - p2.y) * (p3.y - p2.y)));

  if (d01 < CENTRIPETAL_EPSILON || d12 < CENTRIPETAL_EPSILON || d23 < CENTRIPETAL_EPSILON) {
    _cpOut.cp1x = p1.x + (p2.x - p0.x) / 6;
    _cpOut.cp1y = p1.y + (p2.y - p0.y) / 6;
    _cpOut.cp2x = p2.x - (p3.x - p1.x) / 6;
    _cpOut.cp2y = p2.y - (p3.y - p1.y) / 6;
    return _cpOut;
  }

  const d01_d12 = d01 + d12;
  const d12_d23 = d12 + d23;

  const v1x = (p1.x - p0.x) / d01 - (p2.x - p0.x) / d01_d12 + (p2.x - p1.x) / d12;
  const v1y = (p1.y - p0.y) / d01 - (p2.y - p0.y) / d01_d12 + (p2.y - p1.y) / d12;

  const v2x = (p2.x - p1.x) / d12 - (p3.x - p1.x) / d12_d23 + (p3.x - p2.x) / d23;
  const v2y = (p2.y - p1.y) / d12 - (p3.y - p1.y) / d12_d23 + (p3.y - p2.y) / d23;

  const scale = d12 / 3;
  _cpOut.cp1x = p1.x + v1x * scale;
  _cpOut.cp1y = p1.y + v1y * scale;
  _cpOut.cp2x = p2.x - v2x * scale;
  _cpOut.cp2y = p2.y - v2y * scale;
  return _cpOut;
}

// ---------------------------------------------------------------------------
// Segment helpers
// ---------------------------------------------------------------------------

function mirrorPoint(anchor: Point, ref: Point): Point {
  return { x: 2 * anchor.x - ref.x, y: 2 * anchor.y - ref.y };
}

function appendSegmentTo(path: SkPath, points: ReadonlyArray<Point>, i: number): void {
  const curr = points[i];
  const next = points[i + 1];
  const prev = i > 0 ? points[i - 1] : mirrorPoint(curr, next);
  const nextNext = i + 2 < points.length ? points[i + 2] : mirrorPoint(next, curr);

  if (
    !isValidPoint(prev) ||
    !isValidPoint(curr) ||
    !isValidPoint(next) ||
    !isValidPoint(nextNext)
  ) {
    return;
  }

  const cp = centripetalControlPointsMut(prev, curr, next, nextNext);
  path.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, next.x, next.y);
}

// ---------------------------------------------------------------------------
// buildSmoothPath — Catmull-Rom cubic Bézier (full rebuild)
// ---------------------------------------------------------------------------

export function buildSmoothPath(points: ReadonlyArray<Point>): SkPath {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;

  const first = points[0];
  if (!isValidPoint(first)) return path;

  path.moveTo(first.x, first.y);

  if (points.length === 1) return path;

  if (points.length < 3) {
    const second = points[1];
    if (isValidPoint(second)) {
      path.lineTo(second.x, second.y);
    }
    return path;
  }

  for (let i = 0; i < points.length - 1; i++) {
    appendSegmentTo(path, points, i);
  }

  return path;
}

// ---------------------------------------------------------------------------
// IncrementalPathBuilder — frozen prefix 최적화
//
// 라이브 드로잉 시 전체 path를 매번 재계산하지 않고, 확정된 prefix를 유지하고
// 마지막 segment만 재계산.
//
// Segment i는 points[i-1, i, i+1, i+2]에 의존. 다음 point 추가 시:
//   - i = N-2 (마지막): i+2 = N → mirrorPoint fallback. 새 point가 i+2가 되어 결과 변경 — freeze 불가.
//   - i = N-3: i+2 = N-1 (실제 point). 다음 point 추가에 영향 X — freeze 가능.
// 따라서 freeze max i = N-3, canFreezeUpTo = N-2 (반복 [frozenUpTo, canFreezeUpTo)).
//
// 시나리오: 200 points 획 → 기존 full rebuild O(n)
//          → frozen prefix: 마지막 1 segment만 live 재계산 O(1)
// ---------------------------------------------------------------------------

export class IncrementalPathBuilder {
  private frozenPath: SkPath;
  private frozenUpTo = 0;

  constructor() {
    this.frozenPath = Skia.Path.Make();
  }

  reset(): void {
    this.frozenPath = Skia.Path.Make();
    this.frozenUpTo = 0;
  }

  /**
   * 현재 points 배열로 path를 증분 업데이트.
   * 확정 가능한 segments는 frozenPath에 추가하고, trailing segment를 포함한 live path 반환.
   */
  update(points: ReadonlyArray<Point>): SkPath {
    if (points.length === 0) return Skia.Path.Make();

    const first = points[0];
    if (!isValidPoint(first)) return Skia.Path.Make();

    if (points.length < 3) {
      const path = Skia.Path.Make();
      path.moveTo(first.x, first.y);
      if (points.length === 2 && isValidPoint(points[1])) {
        path.lineTo(points[1].x, points[1].y);
      }
      return path;
    }

    const canFreezeUpTo = Math.max(0, points.length - 2);

    if (canFreezeUpTo > this.frozenUpTo) {
      if (this.frozenUpTo === 0) {
        this.frozenPath.moveTo(first.x, first.y);
      }
      for (let i = this.frozenUpTo; i < canFreezeUpTo; i++) {
        appendSegmentTo(this.frozenPath, points, i);
      }
      this.frozenUpTo = canFreezeUpTo;
    }

    const live = this.frozenPath.copy();
    if (this.frozenUpTo === 0) {
      live.moveTo(first.x, first.y);
    }
    for (let i = this.frozenUpTo; i < points.length - 1; i++) {
      appendSegmentTo(live, points, i);
    }

    return live;
  }
}
