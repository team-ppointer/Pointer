import type {
  ReadonlyActiveStrokeSession,
  ReadonlyDrawingDocument,
  ReadonlyStroke,
  ReadonlyStrokeBounds,
} from '../model/drawingTypes';

export type EngineResult = {
  readonly document: ReadonlyDrawingDocument;
  readonly session: ReadonlyActiveStrokeSession;
  readonly strokeBounds: ReadonlyArray<ReadonlyStrokeBounds>;
  readonly changed: boolean;
  readonly maxY: number;
  readonly appendedStroke?: ReadonlyStroke;
  readonly appendedStrokeBounds?: ReadonlyStrokeBounds;
  readonly retainedStrokeIndices?: ReadonlyArray<number>;
};
