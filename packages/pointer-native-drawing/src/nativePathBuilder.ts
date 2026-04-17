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
  var __PointerNativeDrawing_getNativeLivePath: (() => SkPath | null) | undefined;
  var __PointerNativeDrawing_registerLivePathCallback:
    | ((callback: (path: SkPath) => void) => void)
    | undefined;
  var __PointerNativeDrawing_setSessionConfig:
    | ((
        config: WritingFeelConfig,
        targetSpacing: number,
        smoothingFactor: number,
        strokeWidth: number
      ) => void)
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
function packSamples(samples: ReadonlyArray<ReadonlyStrokeSample> | Float64Array): Float64Array {
  if (samples instanceof Float64Array) return samples;
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
/**
 * Retrieve the live SkPath built by the native drawing session (Phase 3).
 * Returns null when no native session is active or on non-iOS platforms.
 * When available, the JS renderer can skip its own path building pipeline.
 */
export function getNativeLivePath(): SkPath | null {
  if (!ensureInstalled()) return null;
  return globalThis.__PointerNativeDrawing_getNativeLivePath?.() ?? null;
}

/**
 * Register a callback that receives native-built live paths via CallInvoker
 * (Phase 3D). Bypasses Fabric event serialization for ~0.5ms latency savings.
 * Falls back to getNativeLivePath() polling if not available.
 */
export function registerLivePathCallback(callback: (path: SkPath) => void): boolean {
  if (!ensureInstalled()) return false;
  if (!globalThis.__PointerNativeDrawing_registerLivePathCallback) return false;
  globalThis.__PointerNativeDrawing_registerLivePathCallback(callback);
  return true;
}

/**
 * Sync drawing config to native StylusInputView session (Phase 3).
 * Must be called whenever strokeWidth, writingFeelConfig, or DPI changes.
 */
export function setNativeSessionConfig(
  config: WritingFeelConfig,
  targetSpacing: number,
  smoothingFactor: number,
  strokeWidth: number
): void {
  if (!ensureInstalled()) return;
  globalThis.__PointerNativeDrawing_setSessionConfig?.(
    config,
    targetSpacing,
    smoothingFactor,
    strokeWidth
  );
}

export function nativeBuildCenterlinePath(
  samples: ReadonlyArray<ReadonlyStrokeSample> | Float64Array,
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
