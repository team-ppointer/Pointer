import type { StrokeSample, WritingFeelConfig } from './drawingTypes';

/**
 * Returns true when the config produces a constant stroke width
 * (no pressure/velocity influence), allowing centerline stroke rendering
 * instead of the heavier polygon envelope path.
 */
export function isFixedWidthConfig(config: WritingFeelConfig): boolean {
  return (
    config.minWidth === config.maxWidth &&
    config.pressureWeight === 0 &&
    config.velocityWeight === 0
  );
}

export const DEFAULT_WRITING_FEEL_CONFIG: WritingFeelConfig = {
  minWidth: 2.5,
  maxWidth: 2.5,
  pressureGamma: 1.0,
  pressureWeight: 0.0,
  velocityWeight: 0.0,
  velocitySmoothing: 0.0,
  velocityThinningK: 0.0,
  widthSmoothing: 0.0,
  tiltSensitivity: 0.0,
};

/**
 * Compute raw velocity (px/ms) between two consecutive samples,
 * plus an EMA-smoothed velocity for width computation.
 *
 * @param smoothingAlpha EMA alpha — higher = more responsive, lower = smoother (default 0.15)
 */
export function computeVelocity(
  prev: StrokeSample,
  curr: StrokeSample,
  smoothingAlpha = 0.15
): { raw: number; smoothed: number } {
  const dt = curr.timestamp - prev.timestamp;
  if (dt <= 0) {
    const fallback = prev.smoothedVelocity ?? prev.velocity ?? 0;
    return { raw: prev.velocity ?? 0, smoothed: fallback };
  }

  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;
  const raw = Math.hypot(dx, dy) / dt;

  const prevSmoothed = prev.smoothedVelocity ?? prev.velocity ?? 0;
  const smoothed = smoothingAlpha * raw + (1 - smoothingAlpha) * prevSmoothed;
  return { raw, smoothed };
}

/**
 * Resolve dynamic stroke width from a single sample.
 *
 * 1. Pressure → gamma power curve (`pressureGamma`)
 * 2. Velocity → hyperbolic thinning (`1 / (1 + k * v)`)
 * 3. Tilt → optional magnification (off by default)
 * 4. Width EMA smoothing against `prevSmoothedWidth`
 */
export function resolveDynamicStrokeWidth(
  sample: StrokeSample,
  config: WritingFeelConfig,
  prevSmoothedWidth?: number
): number {
  const {
    minWidth,
    maxWidth,
    pressureGamma,
    pressureWeight,
    velocityWeight,
    velocityThinningK,
    widthSmoothing,
    tiltSensitivity,
  } = config;
  const range = maxWidth - minWidth;

  // 1. Pressure: gamma power curve
  let pressureFactor = 1;
  if (sample.pressure !== undefined && sample.pressure > 0) {
    pressureFactor = Math.pow(sample.pressure, pressureGamma);
  }

  // 2. Velocity: hyperbolic thinning (uses smoothed velocity when available)
  let velocityFactor = 1;
  const v = sample.smoothedVelocity ?? sample.velocity;
  if (v !== undefined && v > 0) {
    velocityFactor = 1 / (1 + velocityThinningK * v);
  }

  // 3. Weighted combination
  const totalWeight = pressureWeight + velocityWeight;
  const combined =
    totalWeight > 0
      ? (pressureFactor * pressureWeight + velocityFactor * velocityWeight) / totalWeight
      : 1;

  let rawWidth = minWidth + range * Math.max(0, Math.min(1, combined));

  // 4. Tilt magnification (opt-in, off by default)
  if (tiltSensitivity > 0 && sample.tiltX !== undefined && sample.tiltY !== undefined) {
    const tiltMag = Math.hypot(sample.tiltX, sample.tiltY);
    rawWidth *= 1 + tiltSensitivity * tiltMag;
    rawWidth = Math.min(rawWidth, maxWidth * 1.5);
  }

  // 5. Width EMA smoothing
  if (prevSmoothedWidth !== undefined) {
    return widthSmoothing * rawWidth + (1 - widthSmoothing) * prevSmoothedWidth;
  }
  return rawWidth;
}
