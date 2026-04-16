import type {
  ActiveStrokeSession,
  DrawingDocument,
  InputEvent,
  ReadonlyActiveStrokeSession,
  ReadonlyDrawingDocument,
  ReadonlyPoint,
  ReadonlyStrokeBounds,
  ReadonlyStrokeSample,
  Stroke,
  StrokeBounds,
  StrokeSample,
} from '../model/drawingTypes';
import {
  appendPointWithInterpolation,
  deepCopyStrokes,
  getStrokeBounds,
  isPointNearBounds,
  normalizeStrokeWidth,
  pointToSegmentDistanceSquared,
  resolveMaxPointGap,
} from '../model/strokeUtils';
import { computeVelocity } from '../model/writingFeel';

import type { EngineResult } from './engineTypes';

const ERASER_THROTTLE_MS = 16;

type FinalizeStrokeOptions = {
  strokeColor: string;
  strokeWidth: number;
};

type AddPointOptions = {
  strokeWidth: number;
  /** Skip velocity computation in fixed-width mode (velocityWeight=0) */
  fixedWidth?: boolean;
};

type ErasePointOptions = {
  eraserSize: number;
};

export class DrawingEngine {
  private document: DrawingDocument = { strokes: [] };

  private session: ActiveStrokeSession = { points: [], samples: [] };

  private strokeBounds: StrokeBounds[] = [];

  private strokesVersion = 0;

  private strokesSnapshotCache: {
    version: number;
    snapshot: Stroke[];
  } | null = null;

  private lastEraserTime = 0;

  private committedMaxY = 0;

  private sessionMaxY = 0;

  getDocument(): ReadonlyDrawingDocument {
    return this.document;
  }

  getSession(): ReadonlyActiveStrokeSession {
    return this.session;
  }

  getSessionPoints(): ReadonlyArray<ReadonlyPoint> {
    return this.session.points;
  }

  getSessionSamples(): ReadonlyArray<ReadonlyStrokeSample> {
    return this.session.samples;
  }

  hasActiveSession(): boolean {
    return this.session.points.length > 0;
  }

  discardSession(): void {
    this.session = { points: [], samples: [] };
    this.sessionMaxY = 0;
  }

  getStrokeBounds(): ReadonlyArray<ReadonlyStrokeBounds> {
    return this.strokeBounds;
  }

  getStrokes(): Stroke[] {
    const cached = this.strokesSnapshotCache;
    if (cached && cached.version === this.strokesVersion) {
      return cached.snapshot;
    }

    const snapshot = deepCopyStrokes(this.document.strokes);
    this.strokesSnapshotCache = {
      version: this.strokesVersion,
      snapshot,
    };
    return snapshot;
  }

  applyStrokes(nextStrokes: Stroke[]): EngineResult {
    const copied = deepCopyStrokes(nextStrokes);
    for (let i = 0; i < copied.length; i++) {
      copied[i].width = normalizeStrokeWidth(copied[i].width);
    }
    this.session = { points: [], samples: [] };
    this.sessionMaxY = 0;
    this.replaceDocument(
      copied,
      copied.map((stroke) => getStrokeBounds(stroke.points))
    );
    return this.createResult(true);
  }

  clear(): EngineResult {
    return this.applyStrokes([]);
  }

  startStroke(input: InputEvent): EngineResult {
    const sample: StrokeSample = {
      x: input.x,
      y: input.y,
      pressure: input.pressure,
      tiltX: input.tiltX,
      tiltY: input.tiltY,
      velocity: 0,
      timestamp: input.timestamp,
    };
    this.session = {
      points: [{ x: input.x, y: input.y }],
      samples: [sample],
    };
    this.sessionMaxY = input.y;
    return this.createResult(false);
  }

  addPoint(input: InputEvent, options: AddPointOptions): EngineResult {
    appendPointWithInterpolation(
      this.session.points,
      { x: input.x, y: input.y },
      resolveMaxPointGap(options.strokeWidth)
    );

    const prevSample = this.session.samples[this.session.samples.length - 1];
    const sample: StrokeSample = {
      x: input.x,
      y: input.y,
      pressure: input.pressure,
      tiltX: input.tiltX,
      tiltY: input.tiltY,
      timestamp: input.timestamp,
    };
    // [fixed-width skip] velocity computation only needed for variable-width rendering
    if (!options.fixedWidth && prevSample) {
      const vel = computeVelocity(prevSample, sample);
      sample.velocity = vel.raw;
      sample.smoothedVelocity = vel.smoothed;
    }
    this.session.samples.push(sample);

    if (input.y > this.sessionMaxY) {
      this.sessionMaxY = input.y;
    }
    return this.createResult(false);
  }

  finalizeStroke(options: FinalizeStrokeOptions): EngineResult {
    if (this.session.points.length === 0) {
      this.session = { points: [], samples: [] };
      return this.createResult(false);
    }

    const pointsToFinalize = [...this.session.points];
    const samplesToFinalize =
      this.session.samples.length > 0 ? [...this.session.samples] : undefined;
    const appendedStroke: Stroke = {
      points: pointsToFinalize,
      color: options.strokeColor,
      width: normalizeStrokeWidth(options.strokeWidth),
      ...(samplesToFinalize ? { samples: samplesToFinalize } : {}),
    };
    const appendedStrokeBounds = getStrokeBounds(pointsToFinalize);

    this.session = { points: [], samples: [] };
    this.sessionMaxY = 0;
    this.replaceDocument(
      [...this.document.strokes, appendedStroke],
      [...this.strokeBounds, appendedStrokeBounds]
    );

    return {
      ...this.createResult(true),
      appendedStroke,
      appendedStrokeBounds,
    };
  }

  eraseAtPoint(input: InputEvent, options: ErasePointOptions): EngineResult {
    if (input.timestamp - this.lastEraserTime < ERASER_THROTTLE_MS) {
      return this.createResult(false);
    }

    this.lastEraserTime = input.timestamp;

    const thresholdSquared = options.eraserSize * options.eraserSize;
    const nextStrokes: Stroke[] = [];
    const nextBounds: StrokeBounds[] = [];
    const retainedStrokeIndices: number[] = [];

    for (let i = 0; i < this.document.strokes.length; i++) {
      const stroke = this.document.strokes[i];
      const bounds = this.strokeBounds[i];

      if (bounds && !isPointNearBounds(input.x, input.y, options.eraserSize, bounds)) {
        nextStrokes.push(stroke);
        nextBounds.push(bounds);
        retainedStrokeIndices.push(i);
        continue;
      }

      let isTouched = false;
      const pts = stroke.points;
      if (pts.length === 1) {
        const dx = pts[0].x - input.x;
        const dy = pts[0].y - input.y;
        isTouched = dx * dx + dy * dy < thresholdSquared;
      } else {
        for (let j = 0; j < pts.length - 1; j++) {
          const a = pts[j];
          const b = pts[j + 1];
          if (
            pointToSegmentDistanceSquared(input.x, input.y, a.x, a.y, b.x, b.y) < thresholdSquared
          ) {
            isTouched = true;
            break;
          }
        }
      }

      if (!isTouched) {
        nextStrokes.push(stroke);
        nextBounds.push(bounds ?? getStrokeBounds(stroke.points));
        retainedStrokeIndices.push(i);
      }
    }

    if (nextStrokes.length === this.document.strokes.length) {
      return this.createResult(false);
    }

    this.replaceDocument(nextStrokes, nextBounds);
    return {
      ...this.createResult(true),
      retainedStrokeIndices,
    };
  }

  private replaceDocument(nextStrokes: Stroke[], nextBounds: StrokeBounds[]): void {
    this.document = { strokes: nextStrokes };
    this.strokeBounds = nextBounds;
    let maxY = 0;
    for (let i = 0; i < nextBounds.length; i++) {
      if (nextBounds[i].maxY > maxY) maxY = nextBounds[i].maxY;
    }
    this.committedMaxY = maxY;
    this.strokesVersion += 1;
    this.strokesSnapshotCache = null;
  }

  private getMaxY(): number {
    return Math.max(this.committedMaxY, this.sessionMaxY);
  }

  private createResult(changed: boolean): EngineResult {
    return {
      document: this.document,
      session: this.session,
      strokeBounds: this.strokeBounds,
      changed,
      maxY: this.getMaxY(),
    };
  }
}
