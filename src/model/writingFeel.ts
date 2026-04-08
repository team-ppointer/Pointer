import type { StrokeSample, WritingFeelConfig } from "./drawingTypes";

export const DEFAULT_WRITING_FEEL_CONFIG: WritingFeelConfig = {
  minWidth: 1.2,
  maxWidth: 4.5,
  pressureSensitivity: 0.6,
  velocitySensitivity: 0.4,
};

export function computeVelocity(
  prev: StrokeSample,
  curr: StrokeSample,
): number {
  const dt = curr.timestamp - prev.timestamp;
  if (dt <= 0) return prev.velocity ?? 0;

  const dx = curr.x - prev.x;
  const dy = curr.y - prev.y;
  const distance = Math.hypot(dx, dy);
  return distance / dt;
}

export function resolveDynamicStrokeWidth(
  sample: StrokeSample,
  config: WritingFeelConfig,
): number {
  const { minWidth, maxWidth, pressureSensitivity, velocitySensitivity } = config;
  const range = maxWidth - minWidth;

  let pressureFactor = 1;
  if (sample.pressure !== undefined && sample.pressure > 0) {
    pressureFactor = sample.pressure;
  }

  let velocityFactor = 1;
  if (sample.velocity !== undefined) {
    // Higher velocity → thinner stroke (inverse relationship)
    // Clamp velocity to a reasonable range (0-10 px/ms)
    const normalizedVelocity = Math.min(sample.velocity / 10, 1);
    velocityFactor = 1 - normalizedVelocity;
  }

  const combined =
    pressureFactor * pressureSensitivity +
    velocityFactor * velocitySensitivity;

  // Normalize by total sensitivity weight
  const totalWeight = pressureSensitivity + velocitySensitivity;
  const normalizedCombined = totalWeight > 0 ? combined / totalWeight : 1;

  return minWidth + range * Math.max(0, Math.min(1, normalizedCombined));
}
