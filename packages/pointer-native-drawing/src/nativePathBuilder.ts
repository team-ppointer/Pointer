import type { SkPath } from '@shopify/react-native-skia';
import { NativeModules } from 'react-native';

import type { ReadonlyPoint, ReadonlyStrokeSample, WritingFeelConfig } from './model/drawingTypes';
import type { PathBuildState } from './smoothing';

const STRIDE = 8;

let installed = false;
let triedInstall = false;

declare global {
  var __PointerNativeDrawing_buildSmoothPath: ((buf: Float64Array) => SkPath) | undefined;
  var __PointerNativeDrawing_buildVariableWidthPath:
    | ((
        buf: Float64Array,
        config: WritingFeelConfig,
        state?: { lastSmoothedWidth: number },
        taperStart?: boolean,
        taperEnd?: boolean
      ) => { path: SkPath; lastSmoothedWidth: number })
    | undefined;
  var __PointerNativeDrawing_buildCenterlinePath:
    | ((
        buf: Float64Array,
        config: WritingFeelConfig,
        targetSpacing?: number,
        smoothingFactor?: number
      ) => SkPath)
    | undefined;
}

function ensureInstalled(): boolean {
  if (installed) return true;
  if (typeof globalThis.__PointerNativeDrawing_buildVariableWidthPath === 'function') {
    installed = true;
    return true;
  }

  if (triedInstall) return false;
  triedInstall = true;

  try {
    const mod = NativeModules.PointerDrawingPathBuilder;
    if (mod?.install) {
      installed = !!mod.install();
      return installed;
    }
  } catch {
    // Module not available (e.g. Android) — JS fallback
  }

  return false;
}

export function hasNativePathBuilder(): boolean {
  return ensureInstalled();
}

/**
 * Pack StrokeSamples into a flat Float64Array (stride 8) for JSI transfer.
 * Optional fields (pressure, tiltX, tiltY, velocity, smoothedVelocity) are
 * mapped: `undefined` → `NaN`. The C++ side uses `std::isnan()` to detect
 * absent values, which is semantically equivalent to the TS `=== undefined`
 * checks in the JS pipeline.
 */
function packSamples(samples: ReadonlyArray<ReadonlyStrokeSample>): Float64Array {
  const buf = new Float64Array(samples.length * STRIDE);
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const off = i * STRIDE;
    buf[off] = s.x;
    buf[off + 1] = s.y;
    buf[off + 2] = s.pressure ?? NaN;
    buf[off + 3] = s.tiltX ?? NaN;
    buf[off + 4] = s.tiltY ?? NaN;
    buf[off + 5] = s.velocity ?? NaN;
    buf[off + 6] = s.smoothedVelocity ?? NaN;
    buf[off + 7] = s.timestamp;
  }
  return buf;
}

/** Pack Point[] for buildSmoothPath only (no pressure/velocity/timestamp). */
function packPoints(points: ReadonlyArray<ReadonlyPoint>): Float64Array {
  const buf = new Float64Array(points.length * STRIDE);
  for (let i = 0; i < points.length; i++) {
    const off = i * STRIDE;
    buf[off] = points[i].x;
    buf[off + 1] = points[i].y;
    buf[off + 2] = NaN; // pressure
    buf[off + 3] = NaN; // tiltX
    buf[off + 4] = NaN; // tiltY
    buf[off + 5] = NaN; // velocity
    buf[off + 6] = NaN; // smoothedVelocity
    buf[off + 7] = 0; // timestamp
  }
  return buf;
}

export function nativeBuildSmoothPath(points: ReadonlyArray<ReadonlyPoint>): SkPath | null {
  if (!ensureInstalled()) return null;
  return globalThis.__PointerNativeDrawing_buildSmoothPath!(packPoints(points));
}

/**
 * @deprecated Variable-width rendering is deprecated. Preserved for future reactivation.
 */
export function nativeBuildVariableWidthPath(
  samples: ReadonlyArray<ReadonlyStrokeSample>,
  config: WritingFeelConfig,
  state?: PathBuildState,
  taperStart = true,
  taperEnd = true
): { path: SkPath; lastSmoothedWidth: number } | null {
  if (!ensureInstalled()) return null;
  return globalThis.__PointerNativeDrawing_buildVariableWidthPath!(
    packSamples(samples),
    config,
    state ? { lastSmoothedWidth: state.lastSmoothedWidth ?? NaN } : undefined,
    taperStart,
    taperEnd
  );
}

/**
 * Native-only centerline path (resample + smooth + Catmull-Rom, fixed-width).
 * Returns `null` when the native module is unavailable (e.g. Android).
 */
export function nativeBuildCenterlinePath(
  samples: ReadonlyArray<ReadonlyStrokeSample>,
  config: WritingFeelConfig,
  targetSpacing?: number,
  smoothingFactor?: number
): SkPath | null {
  if (!ensureInstalled()) return null;
  return globalThis.__PointerNativeDrawing_buildCenterlinePath!(
    packSamples(samples),
    config,
    targetSpacing,
    smoothingFactor
  );
}
