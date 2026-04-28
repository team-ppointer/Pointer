// ── 기본 타입 ──

export type Point = { x: number; y: number };

export type Stroke = {
  points: Point[];
  color: string;
  width: number;
};

export type TextItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
};

// ── Readonly 타입 (불변 참조용) ──

export type ReadonlyPoint = Readonly<Point>;

export type ReadonlyStroke = {
  readonly points: readonly ReadonlyPoint[];
  readonly color: string;
  readonly width: number;
};

// ── Bounds ──

/** stroke의 AABB (axis-aligned bounding box). 지우개 히트 테스트 최적화 기반. */
export type StrokeBounds = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
};

// ── 컴포넌트 공개 API ──

export type DrawingCanvasRef = {
  clear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getStrokes: () => Stroke[];
  setStrokes: (strokes: Stroke[]) => void;
  getTexts: () => TextItem[];
  setTexts: (texts: TextItem[]) => void;
};
