export { default as DrawingCanvas } from './DrawingCanvas';
export { buildSmoothPath } from './smoothing';

// model
export type { Point, Stroke, TextItem, DrawingCanvasRef } from './model/drawingTypes';
export type { ReadonlyPoint, ReadonlyStroke, StrokeBounds } from './model/drawingTypes';
export { deepCopyStrokes, deepCopyTexts, safeMax, computeStrokeBounds } from './model/strokeUtils';
