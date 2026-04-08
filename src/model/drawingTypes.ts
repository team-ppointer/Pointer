export type Point = { x: number; y: number };

export type StrokeSample = {
  x: number;
  y: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  velocity?: number;
  timestamp: number;
};

export type WritingFeelConfig = {
  minWidth: number;
  maxWidth: number;
  pressureSensitivity: number;
  velocitySensitivity: number;
};

export type Stroke = {
  points: Point[];
  color: string;
  width: number;
  opacity?: number;
  strokeCap?: "round" | "butt";
  samples?: StrokeSample[];
};

export type ActiveStrokeSession = {
  points: Point[];
  samples: StrokeSample[];
};

export type PointerType = "touch" | "pen" | "mouse" | "unknown";

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
  Omit<Stroke, "points" | "samples"> & {
    readonly points: ReadonlyArray<ReadonlyPoint>;
    readonly samples?: ReadonlyArray<ReadonlyStrokeSample>;
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
