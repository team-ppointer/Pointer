import type {
  ReadonlyStroke,
  ReadonlyStrokeBounds,
  ReadonlyStrokeSample,
} from '../model/drawingTypes';

export type RendererViewport = {
  scrollOffsetY: number;
  viewportHeight: number;
};

export type CommittedStrokeDiff = {
  nextStrokes: ReadonlyArray<ReadonlyStroke>;
  nextBounds: ReadonlyArray<ReadonlyStrokeBounds>;
  appendedStroke?: ReadonlyStroke;
  retainedStrokeIndices?: ReadonlyArray<number>;
};

export type RendererState = {
  readonly strokes: ReadonlyArray<ReadonlyStroke>;
  readonly strokeBounds: ReadonlyArray<ReadonlyStrokeBounds>;
  readonly viewport: RendererViewport;
};

export type RendererActions = {
  startLivePath: (x: number, y: number) => void;
  scheduleLivePathRender: (samples: ReadonlyArray<ReadonlyStrokeSample>) => void;
  cancelScheduledLivePathRender: () => void;
  resetLivePath: () => void;
  replaceCommittedStrokes: (
    nextStrokes: ReadonlyArray<ReadonlyStroke>,
    nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
    prebuiltPaths?: readonly unknown[]
  ) => void;
  appendCommittedStroke: (
    nextStrokes: ReadonlyArray<ReadonlyStroke>,
    nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
    appendedStroke: ReadonlyStroke
  ) => void;
  retainOrRebuildCommittedStrokes: (
    nextStrokes: ReadonlyArray<ReadonlyStroke>,
    nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
    retainedStrokeIndices?: ReadonlyArray<number>
  ) => void;
  popCommittedStroke: (
    nextStrokes: ReadonlyArray<ReadonlyStroke>,
    nextBounds: ReadonlyArray<ReadonlyStrokeBounds>
  ) => void;
  getCommittedPaths: () => readonly unknown[];
  updateViewport: (viewport: RendererViewport) => void;
};
