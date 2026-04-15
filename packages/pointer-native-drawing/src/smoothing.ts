// TODO: SkPath는 타입으로만 사용됨 — `import type { SkPath }`로 분리할 것
import { Skia, SkPath } from "@shopify/react-native-skia";
import type {
  ReadonlyPoint,
  ReadonlyStrokeSample,
  StrokeSample,
  WritingFeelConfig,
} from "./model/drawingTypes";
import {
  resolveDynamicStrokeWidth,
  DEFAULT_WRITING_FEEL_CONFIG,
} from "./model/writingFeel";
import {
  hasNativePathBuilder,
  nativeBuildSmoothPath,
  nativeBuildCenterlinePath,
  nativeBuildVariableWidthPath,
} from "./nativePathBuilder";

/** Minimum knot interval below which we fall back to uniform 1/6 control points */
const CENTRIPETAL_EPSILON = 1e-6;

/**
 * Centerline smoothing blend factor.
 * 0 = no smoothing, 1 = full kernel average replacement.
 * Single source of truth — passed to C++ via JSI parameter.
 */
export const CENTERLINE_SMOOTHING_FACTOR = 0.3;

/** Kappa constant for quarter-circle cubic Bézier approximation */
const KAPPA = 0.5523;

const isValidPoint = (point: ReadonlyPoint): boolean =>
  Number.isFinite(point.x) && Number.isFinite(point.y);

// ---------------------------------------------------------------------------
// Catmull-Rom control points (unchanged)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Internal mutable singleton — avoids allocating {cp1x,cp1y,cp2x,cp2y} per call.
// Safe because JS is single-threaded; callers consume values before next call.
// Not safe for Reanimated worklets (separate JS runtime).
// ---------------------------------------------------------------------------

const _cpOut = { cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0 };

export function centripetalControlPointsMut(
  p0: ReadonlyPoint,
  p1: ReadonlyPoint,
  p2: ReadonlyPoint,
  p3: ReadonlyPoint,
): typeof _cpOut {
  const d01 = Math.sqrt(Math.sqrt(
    (p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y),
  ));
  const d12 = Math.sqrt(Math.sqrt(
    (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y),
  ));
  const d23 = Math.sqrt(Math.sqrt(
    (p3.x - p2.x) * (p3.x - p2.x) + (p3.y - p2.y) * (p3.y - p2.y),
  ));

  if (
    d01 < CENTRIPETAL_EPSILON ||
    d12 < CENTRIPETAL_EPSILON ||
    d23 < CENTRIPETAL_EPSILON
  ) {
    _cpOut.cp1x = p1.x + (p2.x - p0.x) / 6;
    _cpOut.cp1y = p1.y + (p2.y - p0.y) / 6;
    _cpOut.cp2x = p2.x - (p3.x - p1.x) / 6;
    _cpOut.cp2y = p2.y - (p3.y - p1.y) / 6;
    return _cpOut;
  }

  const d01_d12 = d01 + d12;
  const d12_d23 = d12 + d23;

  const v1x =
    (p1.x - p0.x) / d01 - (p2.x - p0.x) / d01_d12 + (p2.x - p1.x) / d12;
  const v1y =
    (p1.y - p0.y) / d01 - (p2.y - p0.y) / d01_d12 + (p2.y - p1.y) / d12;

  const v2x =
    (p2.x - p1.x) / d12 - (p3.x - p1.x) / d12_d23 + (p3.x - p2.x) / d23;
  const v2y =
    (p2.y - p1.y) / d12 - (p3.y - p1.y) / d12_d23 + (p3.y - p2.y) / d23;

  const scale = d12 / 3;
  _cpOut.cp1x = p1.x + v1x * scale;
  _cpOut.cp1y = p1.y + v1y * scale;
  _cpOut.cp2x = p2.x - v2x * scale;
  _cpOut.cp2y = p2.y - v2y * scale;
  return _cpOut;
}

// ---------------------------------------------------------------------------
// buildSmoothPath (Point[] fallback — unchanged)
// ---------------------------------------------------------------------------

export function buildSmoothPath(
  points: ReadonlyArray<ReadonlyPoint>,
): SkPath {
  if (hasNativePathBuilder()) {
    const native = nativeBuildSmoothPath(points);
    if (native) return native;
  }

  const path = Skia.Path.Make();
  if (points.length === 0) return path;

  const firstPoint = points[0];
  if (!isValidPoint(firstPoint)) return path;

  path.moveTo(firstPoint.x, firstPoint.y);

  if (points.length === 1) return path;

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
    const previous =
      i > 0
        ? points[i - 1]
        : { x: 2 * current.x - next.x, y: 2 * current.y - next.y };
    const nextNext =
      i + 2 < points.length
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

    const cp = centripetalControlPointsMut(previous, current, next, nextNext);
    path.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, next.x, next.y);
  }

  return path;
}

// ---------------------------------------------------------------------------
// buildCenterlinePath — resample + smooth + Catmull-Rom (fixed-width)
// ---------------------------------------------------------------------------

/**
 * Build a smooth centerline path from StrokeSamples using the full
 * resample → smooth → Catmull-Rom pipeline. Produces higher quality
 * output than `buildSmoothPath` by normalizing sample density and
 * applying centerline smoothing.
 *
 * @param targetSpacing Arc-length spacing in logical points. Lower = smoother.
 *   Use `3.0 / PixelRatio.get()` for DPI-aware spacing.
 */
export function buildCenterlinePath(
  samples: ReadonlyArray<ReadonlyStrokeSample>,
  config: WritingFeelConfig = DEFAULT_WRITING_FEEL_CONFIG,
  targetSpacing = 3.0,
  smoothingFactor = CENTERLINE_SMOOTHING_FACTOR,
): SkPath {
  if (hasNativePathBuilder()) {
    const native = nativeBuildCenterlinePath(samples, config, targetSpacing, smoothingFactor);
    if (native) return native;
  }

  const path = Skia.Path.Make();
  if (samples.length === 0) return path;

  if (samples.length === 1) {
    path.moveTo(samples[0].x, samples[0].y);
    return path;
  }

  const resampled = resampleByArcLength(samples, targetSpacing);
  smoothCenterline(resampled, smoothingFactor);

  path.moveTo(resampled[0].x, resampled[0].y);

  if (resampled.length === 2) {
    path.lineTo(resampled[1].x, resampled[1].y);
    return path;
  }

  for (let i = 0; i < resampled.length - 1; i++) {
    const current = resampled[i];
    const next = resampled[i + 1];
    const previous =
      i > 0
        ? resampled[i - 1]
        : { x: 2 * current.x - next.x, y: 2 * current.y - next.y };
    const nextNext =
      i + 2 < resampled.length
        ? resampled[i + 2]
        : { x: 2 * next.x - current.x, y: 2 * next.y - current.y };

    const cp = centripetalControlPointsMut(previous, current, next, nextNext);
    path.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, next.x, next.y);
  }

  return path;
}

// ---------------------------------------------------------------------------
// Helper: lerp optional number
// ---------------------------------------------------------------------------

function lerpOpt(
  a: number | undefined,
  b: number | undefined,
  t: number,
): number | undefined {
  if (a === undefined || b === undefined) return undefined;
  return a + (b - a) * t;
}

function lerpSample(
  a: ReadonlyStrokeSample,
  b: ReadonlyStrokeSample,
  t: number,
): StrokeSample {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    pressure: lerpOpt(a.pressure, b.pressure, t),
    tiltX: lerpOpt(a.tiltX, b.tiltX, t),
    tiltY: lerpOpt(a.tiltY, b.tiltY, t),
    velocity: lerpOpt(a.velocity, b.velocity, t),
    smoothedVelocity: lerpOpt(a.smoothedVelocity, b.smoothedVelocity, t),
    timestamp: a.timestamp + (b.timestamp - a.timestamp) * t,
  };
}

// ---------------------------------------------------------------------------
// Arc-length resampling
// ---------------------------------------------------------------------------

export function resampleByArcLength(
  samples: ReadonlyArray<ReadonlyStrokeSample>,
  targetSpacing = 3.0,
): StrokeSample[] {
  if (samples.length <= 1) return samples.map((s) => ({ ...s }));

  // Cumulative arc lengths
  const cumLen: number[] = [0];
  for (let i = 1; i < samples.length; i++) {
    const dx = samples[i].x - samples[i - 1].x;
    const dy = samples[i].y - samples[i - 1].y;
    cumLen.push(cumLen[i - 1] + Math.hypot(dx, dy));
  }

  const totalLen = cumLen[cumLen.length - 1];
  if (totalLen < targetSpacing) return samples.map((s) => ({ ...s }));

  const result: StrokeSample[] = [{ ...samples[0] }];
  let nextDist = targetSpacing;
  let segIdx = 0;

  while (nextDist < totalLen) {
    // Advance segIdx to the segment containing nextDist
    while (segIdx < samples.length - 2 && cumLen[segIdx + 1] < nextDist) {
      segIdx++;
    }

    const segStart = cumLen[segIdx];
    const segEnd = cumLen[segIdx + 1];
    const segLen = segEnd - segStart;
    const t = segLen > 0 ? (nextDist - segStart) / segLen : 0;

    result.push(lerpSample(samples[segIdx], samples[segIdx + 1], t));
    nextDist += targetSpacing;
  }

  // Always include the last sample
  result.push({ ...samples[samples.length - 1] });
  return result;
}

// ---------------------------------------------------------------------------
// Post-resample velocity recomputation
// ---------------------------------------------------------------------------

/**
 * Recompute velocity and smoothedVelocity from resampled positions/timestamps.
 * After arc-length resampling, the lerped velocities no longer reflect actual
 * kinematics between the new sample positions. This function recalculates them
 * and applies EMA smoothing.
 *
 * Mutates `samples` in-place (the resampled array is already a fresh copy).
 */
export function recomputeVelocities(
  samples: StrokeSample[],
  alpha: number,
): void {
  if (samples.length === 0) return;

  samples[0].velocity = 0;
  samples[0].smoothedVelocity = 0;

  let prevRaw = 0;
  let prevSmoothed = 0;

  for (let i = 1; i < samples.length; i++) {
    const dx = samples[i].x - samples[i - 1].x;
    const dy = samples[i].y - samples[i - 1].y;
    const dt = samples[i].timestamp - samples[i - 1].timestamp;

    const raw = dt > 0 ? Math.hypot(dx, dy) / dt : prevRaw;
    const smoothed = alpha * raw + (1 - alpha) * prevSmoothed;

    samples[i].velocity = raw;
    samples[i].smoothedVelocity = smoothed;

    prevRaw = raw;
    prevSmoothed = smoothed;
  }
}

// ---------------------------------------------------------------------------
// Centerline smoothing
// ---------------------------------------------------------------------------

/**
 * Smooth the centerline (x, y) with a [0.25, 0.5, 0.25] weighted moving average.
 * Only x/y are modified — pressure, velocity, tilt, timestamp are preserved.
 *
 * Sharp turns (angle > sharpAngleDeg) are skipped to preserve corners.
 * First and last samples are anchored (not smoothed) to preserve cap positions.
 *
 * @param factor Blend factor: smoothed = orig + factor * (kernel_avg - orig)
 */
export function smoothCenterline(
  samples: StrokeSample[],
  factor: number,
  state?: PathBuildState,
): void {
  const n = samples.length;
  if (n < 3) return;

  // Reuse scratch buffers from state if available (grow-only)
  let origX: Float64Array;
  let origY: Float64Array;
  if (state) {
    const minSize = Math.max(n, 64);
    if (!state._scratchX || state._scratchX.length < n) {
      state._scratchX = new Float64Array(minSize);
    }
    if (!state._scratchY || state._scratchY.length < n) {
      state._scratchY = new Float64Array(minSize);
    }
    origX = state._scratchX;
    origY = state._scratchY;
  } else {
    origX = new Float64Array(n);
    origY = new Float64Array(n);
  }
  for (let i = 0; i < n; i++) {
    origX[i] = samples[i].x;
    origY[i] = samples[i].y;
  }

  // cos(60°) = 0.5 — skip samples where the turn angle exceeds 60°
  const cosThreshold = 0.5;

  for (let i = 1; i < n - 1; i++) {
    // Check for sharp turn: vectors (prev→curr) and (curr→next)
    const ax = origX[i] - origX[i - 1];
    const ay = origY[i] - origY[i - 1];
    const bx = origX[i + 1] - origX[i];
    const by = origY[i + 1] - origY[i];
    const magA = Math.hypot(ax, ay);
    const magB = Math.hypot(bx, by);

    if (magA > 1e-8 && magB > 1e-8) {
      const cosAngle = (ax * bx + ay * by) / (magA * magB);
      if (cosAngle < cosThreshold) continue; // sharp turn — skip
    }

    // [0.25, 0.5, 0.25] kernel average
    const avgX = 0.25 * origX[i - 1] + 0.5 * origX[i] + 0.25 * origX[i + 1];
    const avgY = 0.25 * origY[i - 1] + 0.5 * origY[i] + 0.25 * origY[i + 1];

    samples[i].x = origX[i] + factor * (avgX - origX[i]);
    samples[i].y = origY[i] + factor * (avgY - origY[i]);
  }
}

// ---------------------------------------------------------------------------
// Smoothstep & taper
// ---------------------------------------------------------------------------

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/**
 * Apply pressure-fade taper to the start and end of the halfWidths array.
 * Mutates `halfWidths` in-place.
 */
function applyTaper(
  halfWidths: number[],
  taperCount = 4,
  minFraction = 0.15,
  start = true,
  end = true,
): void {
  const n = halfWidths.length;
  // Start taper
  if (start) {
    const startN = Math.min(taperCount, Math.floor(n / 2));
    for (let i = 0; i < startN; i++) {
      const t = (i + 1) / (startN + 1);
      halfWidths[i] *= minFraction + (1 - minFraction) * smoothstep(t);
    }
  }
  // End taper
  if (end) {
    const endN = Math.min(taperCount, Math.floor(n / 2));
    for (let i = 0; i < endN; i++) {
      const idx = n - 1 - i;
      // i=0 → last point (thinnest), i=endN-1 → inner edge (near full)
      const t = (i + 1) / (endN + 1);
      halfWidths[idx] *= minFraction + (1 - minFraction) * smoothstep(t);
    }
  }
}

// computeNormals removed — inlined into buildVariableWidthPath Step 6+7 fused loop

// ---------------------------------------------------------------------------
// Round cap (cubic Bézier semicircle: 2 quarter arcs)
// ---------------------------------------------------------------------------

/**
 * Append a semicircle cap at `(cx, cy)` with the given outward tangent and radius.
 * Assumes the path cursor is already at the "from" point
 * (center + normal * r, where normal is 90° CW from tangent).
 *
 * Draws CW: from → tip → to (center − normal * r).
 */
function addRoundCap(
  path: SkPath,
  cx: number,
  cy: number,
  tx: number,
  ty: number,
  r: number,
): void {
  // Normal: 90° CW from tangent
  const nx = ty;
  const ny = -tx;

  const k = KAPPA * r;

  // Tip of the cap (furthest outward point)
  const tipX = cx + tx * r;
  const tipY = cy + ty * r;

  // Quarter 1: from (center + n*r) → tip (center + t*r)
  path.cubicTo(
    cx + nx * r + tx * k,
    cy + ny * r + ty * k,
    tipX + nx * k,
    tipY + ny * k,
    tipX,
    tipY,
  );

  // Quarter 2: tip → to (center − n*r)
  path.cubicTo(
    tipX - nx * k,
    tipY - ny * k,
    cx - nx * r + tx * k,
    cy - ny * r + ty * k,
    cx - nx * r,
    cy - ny * r,
  );
}

// ---------------------------------------------------------------------------
// Catmull-Rom edge tracing
// ---------------------------------------------------------------------------

/**
 * Trace an array of edge points using centripetal Catmull-Rom cubicTo.
 * Assumes path cursor is already at `edge[0]`.
 */
function traceCatmullRomEdge(
  path: SkPath,
  edge: ReadonlyArray<{ x: number; y: number }>,
): void {
  if (edge.length < 2) return;

  if (edge.length === 2) {
    path.lineTo(edge[1].x, edge[1].y);
    return;
  }

  for (let i = 0; i < edge.length - 1; i++) {
    const current = edge[i];
    const next = edge[i + 1];
    const previous =
      i > 0
        ? edge[i - 1]
        : { x: 2 * current.x - next.x, y: 2 * current.y - next.y };
    const nextNext =
      i + 2 < edge.length
        ? edge[i + 2]
        : { x: 2 * next.x - current.x, y: 2 * next.y - current.y };

    const cp = centripetalControlPointsMut(previous, current, next, nextNext);
    path.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, next.x, next.y);
  }
}

/**
 * Trace an array of edge points in reverse order using centripetal Catmull-Rom cubicTo.
 * Equivalent to traceCatmullRomEdge(path, edge.slice().reverse()) but without
 * allocating a reversed copy of the array.
 * Assumes path cursor is already at `edge[edge.length - 1]`.
 */
function traceCatmullRomEdgeReversed(
  path: SkPath,
  edge: ReadonlyArray<{ x: number; y: number }>,
): void {
  if (edge.length < 2) return;

  if (edge.length === 2) {
    path.lineTo(edge[0].x, edge[0].y);
    return;
  }

  const last = edge.length - 1;
  for (let i = last; i > 0; i--) {
    const current = edge[i];
    const next = edge[i - 1];
    const previous =
      i < last
        ? edge[i + 1]
        : { x: 2 * current.x - next.x, y: 2 * current.y - next.y };
    const nextNext =
      i - 2 >= 0
        ? edge[i - 2]
        : { x: 2 * next.x - current.x, y: 2 * next.y - current.y };

    const cp = centripetalControlPointsMut(previous, current, next, nextNext);
    path.cubicTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, next.x, next.y);
  }
}

// ---------------------------------------------------------------------------
// Tangent at endpoint
// ---------------------------------------------------------------------------

function endpointTangent(
  pts: ReadonlyArray<{ x: number; y: number }>,
  end: "start" | "end",
): { tx: number; ty: number } {
  if (pts.length < 2) return { tx: 1, ty: 0 };

  let dx: number;
  let dy: number;
  if (end === "start") {
    dx = pts[1].x - pts[0].x;
    dy = pts[1].y - pts[0].y;
    // Flip: outward for start cap points backward
    dx = -dx;
    dy = -dy;
  } else {
    const n = pts.length;
    dx = pts[n - 1].x - pts[n - 2].x;
    dy = pts[n - 1].y - pts[n - 2].y;
  }

  const len = Math.hypot(dx, dy);
  if (len < 1e-8) return { tx: 1, ty: 0 };
  return { tx: dx / len, ty: dy / len };
}

// ---------------------------------------------------------------------------
// PathBuildState — mutable EMA continuity across frozen prefix / live tail
// ---------------------------------------------------------------------------

/**
 * Mutable state object that carries the width-EMA state across
 * successive calls to `buildVariableWidthPath`.
 *
 * Usage:
 *  - Create once per live stroke session.
 *  - Pass to `buildVariableWidthPath` for the frozen prefix; the function
 *    writes `lastSmoothedWidth` on exit.
 *  - Pass the *same* object when building the live tail so the EMA
 *    seeds from where the prefix left off.
 */
export type PathBuildState = {
  lastSmoothedWidth?: number;
  /** @internal */ _scratchX?: Float64Array;
  /** @internal */ _scratchY?: Float64Array;
};

// ---------------------------------------------------------------------------
// buildVariableWidthPath — stabilised pipeline
// ---------------------------------------------------------------------------

/**
 * Build a filled variable-width stroke path from Apple Pencil samples.
 *
 * Pipeline:
 *  1. Arc-length resample (3px spacing)
 *  2. Recompute velocities from resampled positions (EMA)
 *  3. Smooth centerline ([0.25, 0.5, 0.25] kernel, sharp-turn preserve)
 *  4. Compute per-sample width with EMA smoothing (seeded from state)
 *  5. Apply start/end taper (smoothstep fade)
 *  6. Compute normals (finite diff, last-valid propagation)
 *  7. Offset to left/right edges
 *  8. Trace edges with centripetal Catmull-Rom cubicTo
 *  9. Semicircle caps at start/end
 *  10. Close path
 */
/**
 * @deprecated Variable-width rendering is deprecated. Use `buildSmoothPath` for
 * fixed-width centerline rendering instead. This function is preserved for
 * future reactivation but is no longer called by the renderer.
 */
export function buildVariableWidthPath(
  samples: ReadonlyArray<ReadonlyStrokeSample>,
  config: WritingFeelConfig = DEFAULT_WRITING_FEEL_CONFIG,
  state?: PathBuildState,
  taper?: { start?: boolean; end?: boolean },
): SkPath {
  if (hasNativePathBuilder()) {
    const native = nativeBuildVariableWidthPath(
      samples,
      config,
      state,
      taper?.start ?? true,
      taper?.end ?? true,
    );
    if (native) {
      if (state) state.lastSmoothedWidth = native.lastSmoothedWidth;
      return native.path;
    }
  }

  const path = Skia.Path.Make();
  if (samples.length === 0) return path;

  // Single-point stroke: draw a dot
  if (samples.length === 1) {
    const w = resolveDynamicStrokeWidth(samples[0], config);
    path.addCircle(samples[0].x, samples[0].y, Math.max(w / 2, 0.5));
    return path;
  }

  // Two-point stroke: minimal path
  if (samples.length === 2) {
    const w0 = resolveDynamicStrokeWidth(samples[0], config) / 2;
    const w1 = resolveDynamicStrokeWidth(samples[1], config) / 2;
    const dx = samples[1].x - samples[0].x;
    const dy = samples[1].y - samples[0].y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    path.moveTo(samples[0].x + nx * w0, samples[0].y + ny * w0);
    path.lineTo(samples[1].x + nx * w1, samples[1].y + ny * w1);
    path.lineTo(samples[1].x - nx * w1, samples[1].y - ny * w1);
    path.lineTo(samples[0].x - nx * w0, samples[0].y - ny * w0);
    path.close();
    return path;
  }

  // --- Step 1: Arc-length resample ---
  const resampled = resampleByArcLength(samples);

  // --- Step 2: Recompute velocities from resampled positions ---
  recomputeVelocities(resampled, config.velocitySmoothing);

  // --- Step 3: Smooth centerline ---
  smoothCenterline(resampled, 0.3, state);

  // --- Step 4: Compute half-widths with EMA smoothing ---
  const halfWidths: number[] = [];
  let prevSmoothedWidth: number | undefined = state?.lastSmoothedWidth;
  for (let i = 0; i < resampled.length; i++) {
    const w = resolveDynamicStrokeWidth(
      resampled[i],
      config,
      prevSmoothedWidth,
    );
    prevSmoothedWidth = w;
    halfWidths.push(w / 2);
  }

  // Write back final EMA state for continuity across prefix/tail
  if (state) {
    state.lastSmoothedWidth = prevSmoothedWidth;
  }

  // --- Step 5: Taper ---
  applyTaper(halfWidths, 4, 0.15, taper?.start ?? true, taper?.end ?? true);

  // --- Step 6+7: Compute normals inline & offset to left/right edges ---
  const leftEdge: { x: number; y: number }[] = [];
  const rightEdge: { x: number; y: number }[] = [];
  let lastNx = 0, lastNy = 1;

  for (let i = 0; i < resampled.length; i++) {
    const s = resampled[i];
    const prev = i > 0 ? resampled[i - 1] : s;
    const next = i < resampled.length - 1 ? resampled[i + 1] : s;
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy);
    let nx: number, ny: number;
    if (len < 1e-8) { nx = lastNx; ny = lastNy; }
    else { nx = -dy / len; ny = dx / len; lastNx = nx; lastNy = ny; }
    const hw = halfWidths[i];
    leftEdge.push({ x: s.x + nx * hw, y: s.y + ny * hw });
    rightEdge.push({ x: s.x - nx * hw, y: s.y - ny * hw });
  }

  // --- Step 8: Trace left edge forward (Catmull-Rom) ---
  path.moveTo(leftEdge[0].x, leftEdge[0].y);
  traceCatmullRomEdge(path, leftEdge);

  // --- Step 9a: End cap (semicircle) ---
  const last = resampled[resampled.length - 1];
  const endTan = endpointTangent(resampled, "end");
  addRoundCap(
    path,
    last.x,
    last.y,
    endTan.tx,
    endTan.ty,
    halfWidths[halfWidths.length - 1],
  );

  // --- Trace right edge backward (Catmull-Rom) ---
  traceCatmullRomEdgeReversed(path, rightEdge);

  // --- Step 9b: Start cap (semicircle) ---
  const first = resampled[0];
  const startTan = endpointTangent(resampled, "start");
  addRoundCap(
    path,
    first.x,
    first.y,
    startTan.tx,
    startTan.ty,
    halfWidths[0],
  );

  // --- Step 10: Close ---
  path.close();

  return path;
}
