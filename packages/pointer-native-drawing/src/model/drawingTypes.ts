export type Point = { x: number; y: number };

export type StrokeSample = {
  x: number;
  y: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  velocity?: number;
  smoothedVelocity?: number;
  timestamp: number;
};

export type WritingFeelConfig = {
  minWidth: number;
  maxWidth: number;
  pressureGamma: number;
  pressureWeight: number;
  velocityWeight: number;
  velocitySmoothing: number;
  velocityThinningK: number;
  widthSmoothing: number;
  tiltSensitivity: number;
};

export type Stroke = {
  points: Point[] | Float64Array;
  color: string;
  width: number;
  opacity?: number;
  strokeCap?: 'round' | 'butt';
  samples?: StrokeSample[] | Float64Array;
};

/** Type guard: stroke uses packed Float64Array format */
export function isPackedStroke(stroke: { points: Point[] | Float64Array }): boolean {
  return stroke.points instanceof Float64Array;
}

/** Get point count regardless of storage format */
export function getPointCount(stroke: { points: Point[] | Float64Array }): number {
  return stroke.points instanceof Float64Array
    ? stroke.points.length / POINT_STRIDE
    : stroke.points.length;
}

/** Get sample count regardless of storage format */
export function getSampleCount(stroke: { samples?: StrokeSample[] | Float64Array }): number {
  if (!stroke.samples) return 0;
  return stroke.samples instanceof Float64Array
    ? stroke.samples.length / SAMPLE_STRIDE
    : stroke.samples.length;
}

/** Access point x at index i */
export function getPointX(points: Point[] | Float64Array, i: number): number {
  return points instanceof Float64Array ? points[i * 2] : points[i].x;
}

/** Access point y at index i */
export function getPointY(points: Point[] | Float64Array, i: number): number {
  return points instanceof Float64Array ? points[i * 2 + 1] : points[i].y;
}

export type ActiveStrokeSession = {
  points: Point[];
  samples: StrokeSample[];
};

// ---------------------------------------------------------------------------
// Packed (Float64Array) stride constants & accessors
// ---------------------------------------------------------------------------

/** Points stride: [x, y, x, y, ...] */
export const POINT_STRIDE = 2;

/** Samples stride: [x, y, pressure, tiltX, tiltY, velocity, smoothedVelocity, timestamp, ...] */
export const SAMPLE_STRIDE = 8;

/** Create a packed points buffer from Point[] */
export function packPoints(points: ReadonlyArray<ReadonlyPoint>): Float64Array {
  const buf = new Float64Array(points.length * POINT_STRIDE);
  for (let i = 0; i < points.length; i++) {
    buf[i * 2] = points[i].x;
    buf[i * 2 + 1] = points[i].y;
  }
  return buf;
}

/** Create a packed samples buffer from StrokeSample[] */
export function packSamplesArray(samples: ReadonlyArray<ReadonlyStrokeSample>): Float64Array {
  const buf = new Float64Array(samples.length * SAMPLE_STRIDE);
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const off = i * SAMPLE_STRIDE;
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

/** Unpack packed samples buffer to StrokeSample[] */
export function unpackSamples(buf: Float64Array): StrokeSample[] {
  const count = buf.length / SAMPLE_STRIDE;
  const result: StrokeSample[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const off = i * SAMPLE_STRIDE;
    const p = buf[off + 2];
    const tx = buf[off + 3];
    const ty = buf[off + 4];
    const v = buf[off + 5];
    const sv = buf[off + 6];
    result[i] = {
      x: buf[off],
      y: buf[off + 1],
      ...(isNaN(p) ? {} : { pressure: p }),
      ...(isNaN(tx) ? {} : { tiltX: tx }),
      ...(isNaN(ty) ? {} : { tiltY: ty }),
      ...(isNaN(v) ? {} : { velocity: v }),
      ...(isNaN(sv) ? {} : { smoothedVelocity: sv }),
      timestamp: buf[off + 7],
    };
  }
  return result;
}

/** Unpack packed points buffer to Point[] */
export function unpackPoints(buf: Float64Array): Point[] {
  const count = buf.length / POINT_STRIDE;
  const result: Point[] = new Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = { x: buf[i * 2], y: buf[i * 2 + 1] };
  }
  return result;
}

export type PointerType = 'touch' | 'pen' | 'mouse' | 'unknown';

export type InputEvent = {
  x: number;
  y: number;
  timestamp: number;
  pressure?: number;
  pointerType?: PointerType;
  tiltX?: number;
  tiltY?: number;
};

export type StrokeBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type DrawingDocument = {
  strokes: Stroke[];
};

// Readonly projections — zero runtime cost, compile-time mutation guard
export type ReadonlyPoint = Readonly<Point>;

export type ReadonlyStrokeSample = Readonly<StrokeSample>;

export type ReadonlyStroke = Readonly<
  Omit<Stroke, 'points' | 'samples'> & {
    readonly points: ReadonlyArray<ReadonlyPoint> | Float64Array;
    readonly samples?: ReadonlyArray<ReadonlyStrokeSample> | Float64Array;
  }
>;

export type ReadonlyActiveStrokeSession = {
  readonly points: ReadonlyArray<ReadonlyPoint>;
  readonly samples: ReadonlyArray<ReadonlyStrokeSample>;
};

export type ReadonlyStrokeBounds = Readonly<StrokeBounds>;

export type ReadonlyDrawingDocument = {
  readonly strokes: ReadonlyArray<ReadonlyStroke>;
};
