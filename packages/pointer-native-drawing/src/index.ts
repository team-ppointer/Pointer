export { default as DrawingCanvas } from './DrawingCanvas';
export { buildSmoothPath } from './smoothing';

// model
export type { Point, Stroke, DrawingCanvasRef } from './model/drawingTypes';
export { deepCopyStrokes, safeMax } from './model/strokeUtils';
