import type { Stroke, StrokeBounds } from "./drawingTypes";

// ---------------------------------------------------------------------------
// Canvas Object Types (Phase 2 준비 — 현재 runtime에서 미사용)
// ---------------------------------------------------------------------------

export type StrokeObject = {
  readonly id: string;
  readonly type: "stroke";
  readonly stroke: Stroke;
  readonly bounds: StrokeBounds;
};

export type TextBoxObject = {
  readonly id: string;
  readonly type: "textbox";
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly text: string;
  readonly fontSize: number;
  readonly fontFamily: string;
  readonly color: string;
  readonly lineHeight?: number;
};

export type CanvasObject = StrokeObject | TextBoxObject;

// ---------------------------------------------------------------------------
// Canvas Document
// ---------------------------------------------------------------------------

/** Unified document model. `objects` index = z-order. */
export type CanvasDocument = {
  readonly objects: CanvasObject[];
};

// ---------------------------------------------------------------------------
// Readonly projections
// ---------------------------------------------------------------------------

export type ReadonlyCanvasObject = Readonly<CanvasObject>;

export type ReadonlyCanvasDocument = {
  readonly objects: ReadonlyArray<ReadonlyCanvasObject>;
};
