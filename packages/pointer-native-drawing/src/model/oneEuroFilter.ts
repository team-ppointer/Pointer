/**
 * 1€ Filter — speed-adaptive low-pass filter for noisy input.
 *
 * At low speed (near-stationary): heavy smoothing to kill jitter.
 * At high speed (fast movement): light smoothing to reduce lag.
 *
 * Reference: Casiez, Roussel, Vogel — "1€ Filter: A Simple Speed-based
 * Low-pass Filter for Noisy Input in Interactive Systems" (CHI 2012)
 */

export type OneEuroFilterConfig = {
  /** Minimum cutoff frequency in Hz. Lower = more smoothing at rest. */
  minCutoff: number;
  /** Speed coefficient. Higher = less smoothing during fast movement. */
  beta: number;
  /** Cutoff frequency for the derivative filter in Hz. */
  dCutoff: number;
};

export const DEFAULT_ONE_EURO_CONFIG: OneEuroFilterConfig = {
  minCutoff: 1.0,
  beta: 0.007,
  dCutoff: 1.0,
};

function smoothingFactor(rate: number, cutoff: number): number {
  const tau = 1.0 / (2 * Math.PI * cutoff);
  const te = 1.0 / rate;
  return 1.0 / (1.0 + tau / te);
}

function exponentialSmoothing(
  alpha: number,
  raw: number,
  prev: number,
): number {
  return alpha * raw + (1 - alpha) * prev;
}

export class OneEuroFilter {
  private config: OneEuroFilterConfig;
  private prevRaw: number | undefined;
  private prevFiltered: number | undefined;
  private prevDx: number;
  private prevTimestamp: number | undefined;

  constructor(config: OneEuroFilterConfig = DEFAULT_ONE_EURO_CONFIG) {
    this.config = config;
    this.prevDx = 0;
  }

  filter(value: number, timestamp: number): number {
    if (this.prevTimestamp === undefined || this.prevFiltered === undefined) {
      this.prevRaw = value;
      this.prevFiltered = value;
      this.prevTimestamp = timestamp;
      return value;
    }

    const dt = (timestamp - this.prevTimestamp) / 1000; // ms → s
    if (dt <= 0) return this.prevFiltered;

    const rate = 1.0 / dt;

    // Derivative estimation (speed of change)
    const dx = (value - this.prevRaw!) / dt;
    const edx = smoothingFactor(rate, this.config.dCutoff);
    const dxFiltered = exponentialSmoothing(edx, dx, this.prevDx);

    // Adaptive cutoff based on speed
    const cutoff = this.config.minCutoff + this.config.beta * Math.abs(dxFiltered);

    // Filter the value
    const alpha = smoothingFactor(rate, cutoff);
    const filtered = exponentialSmoothing(alpha, value, this.prevFiltered);

    this.prevRaw = value;
    this.prevFiltered = filtered;
    this.prevDx = dxFiltered;
    this.prevTimestamp = timestamp;

    return filtered;
  }

  reset(): void {
    this.prevRaw = undefined;
    this.prevFiltered = undefined;
    this.prevDx = 0;
    this.prevTimestamp = undefined;
  }
}

/** Pair of 1€ filters for 2D coordinates. */
export class OneEuroFilter2D {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;

  constructor(config: OneEuroFilterConfig = DEFAULT_ONE_EURO_CONFIG) {
    this.filterX = new OneEuroFilter(config);
    this.filterY = new OneEuroFilter(config);
  }

  filter(x: number, y: number, timestamp: number): { x: number; y: number } {
    return {
      x: this.filterX.filter(x, timestamp),
      y: this.filterY.filter(y, timestamp),
    };
  }

  reset(): void {
    this.filterX.reset();
    this.filterY.reset();
  }
}
