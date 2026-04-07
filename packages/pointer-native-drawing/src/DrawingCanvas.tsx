import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Canvas,
  PaintStyle,
  Path,
  Picture,
  SkPath,
  SkPicture,
  Skia,
  StrokeCap,
  StrokeJoin,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, type SharedValue } from 'react-native-reanimated';

import { buildSmoothPath } from './smoothing';

export type Point = { x: number; y: number };
export type Stroke = {
  points: Point[];
  color: string;
  width: number;
  opacity?: number;
  strokeCap?: 'round' | 'butt';
};

type StrokeBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type TextItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
};

export type DrawingCanvasRef = {
  clear: () => void;
  scrollTo: (y: number, animated?: boolean) => void;
  getStrokes: () => Stroke[];
  setStrokes: (strokes: Stroke[]) => void;
  getTexts: () => TextItem[];
  setTexts: (texts: TextItem[]) => void;
};

export type DrawingViewportTransform = {
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
};

export type DrawingCanvasProps = {
  strokeColor?: string;
  strokeWidth?: number;
  onChange?: (strokes: Stroke[]) => void;
  onScrollOffsetChange?: (offsetY: number) => void;
  onCanvasHeightChange?: (height: number) => void;
  eraserMode?: boolean;
  eraserSize?: number;
  minCanvasHeight?: number;
  textMode?: boolean;
  highlighterMode?: boolean;
  highlighterWidth?: number;
  enableZoomPan?: boolean;
  minZoomScale?: number;
  maxZoomScale?: number;
  viewportTransform?: DrawingViewportTransform;
  textFontPath?: unknown;
};

const MIN_RENDERABLE_STROKE_WIDTH = 1.2;
const DEFAULT_MAX_POINT_GAP = 0.95;
const PAN_MIN_DISTANCE = 0.12;
const ERASER_THROTTLE_MS = 16;
const VISIBLE_STROKE_MARGIN = 280;
const PICTURE_CACHE_STROKE_THRESHOLD = 120;
const LIVE_FULL_REBUILD_POINT_THRESHOLD = 240;

const deepCopyStrokes = (strokes: Stroke[]): Stroke[] =>
  strokes.map((stroke) => ({
    points: stroke.points.map((p) => ({ ...p })),
    color: stroke.color,
    width: stroke.width,
    ...(stroke.opacity !== undefined ? { opacity: stroke.opacity } : {}),
    ...(stroke.strokeCap !== undefined ? { strokeCap: stroke.strokeCap } : {}),
  }));

const getMaxYFromStrokes = (strokes: Stroke[]): number => {
  let max = 0;
  let hasPoint = false;

  for (let i = 0; i < strokes.length; i++) {
    const points = strokes[i].points;
    for (let j = 0; j < points.length; j++) {
      const y = points[j].y;
      if (!hasPoint || y > max) {
        max = y;
        hasPoint = true;
      }
    }
  }

  return hasPoint ? max : 0;
};

const getMaxYFromPoints = (points: Point[]): number => {
  let max = 0;
  let hasPoint = false;

  for (let i = 0; i < points.length; i++) {
    const y = points[i].y;
    if (!hasPoint || y > max) {
      max = y;
      hasPoint = true;
    }
  }

  return hasPoint ? max : 0;
};

const getStrokeBounds = (points: Point[]): StrokeBounds => {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (let i = 1; i < points.length; i++) {
    const { x, y } = points[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY };
};

const isPointNearBounds = (x: number, y: number, radius: number, bounds: StrokeBounds): boolean =>
  x >= bounds.minX - radius &&
  x <= bounds.maxX + radius &&
  y >= bounds.minY - radius &&
  y <= bounds.maxY + radius;

const createCommittedPicture = (paths: SkPath[], strokes: Stroke[]): SkPicture | null => {
  if (paths.length === 0) {
    return null;
  }

  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording();
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeJoin(StrokeJoin.Round);

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const stroke = strokes[i];
    if (!stroke) {
      continue;
    }

    paint.setColor(Skia.Color(stroke.color));
    paint.setStrokeWidth(normalizeStrokeWidth(stroke.width));
    paint.setStrokeCap(stroke.strokeCap === 'butt' ? StrokeCap.Butt : StrokeCap.Round);
    paint.setAlphaf(stroke.opacity ?? 1);
    canvas.drawPath(path, paint);
  }

  return recorder.finishRecordingAsPicture();
};

const normalizeStrokeWidth = (width: number): number =>
  Math.max(MIN_RENDERABLE_STROKE_WIDTH, width);

const resolveMaxPointGap = (activeWidth: number): number => {
  const normalizedWidth = normalizeStrokeWidth(activeWidth);
  if (normalizedWidth <= 1.4) {
    return 0.5;
  }
  if (normalizedWidth <= 2.2) {
    return 0.72;
  }
  return DEFAULT_MAX_POINT_GAP;
};

const appendPointWithInterpolation = (points: Point[], nextPoint: Point, maxGap: number): void => {
  if (points.length === 0) {
    points.push(nextPoint);
    return;
  }

  const lastPoint = points[points.length - 1];
  const dx = nextPoint.x - lastPoint.x;
  const dy = nextPoint.y - lastPoint.y;
  const distance = Math.hypot(dx, dy);

  if (!Number.isFinite(distance) || distance === 0) {
    return;
  }

  if (distance <= maxGap) {
    points.push(nextPoint);
    return;
  }

  const steps = Math.ceil(distance / maxGap);
  for (let i = 1; i < steps; i++) {
    const ratio = i / steps;
    points.push({
      x: lastPoint.x + dx * ratio,
      y: lastPoint.y + dy * ratio,
    });
  }

  points.push(nextPoint);
};

const appendLiveSmoothSegment = (path: SkPath, points: Point[], index: number): boolean => {
  if (index < 0 || index >= points.length - 1) {
    return false;
  }

  const previous = index === 0 ? points[index] : points[index - 1];
  const current = points[index];
  const next = points[index + 1];
  const nextNext = index + 2 < points.length ? points[index + 2] : next;

  if (
    !Number.isFinite(previous.x) ||
    !Number.isFinite(previous.y) ||
    !Number.isFinite(current.x) ||
    !Number.isFinite(current.y) ||
    !Number.isFinite(next.x) ||
    !Number.isFinite(next.y) ||
    !Number.isFinite(nextNext.x) ||
    !Number.isFinite(nextNext.y)
  ) {
    return false;
  }

  const controlPoint1X = current.x + (next.x - previous.x) / 6;
  const controlPoint1Y = current.y + (next.y - previous.y) / 6;
  const controlPoint2X = next.x - (nextNext.x - current.x) / 6;
  const controlPoint2Y = next.y - (nextNext.y - current.y) / 6;

  path.cubicTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, next.x, next.y);
  return true;
};

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      strokeColor = '#1E1E21',
      strokeWidth = 3,
      onChange,
      onScrollOffsetChange,
      onCanvasHeightChange,
      eraserMode = false,
      eraserSize = 20,
      minCanvasHeight = 800,
    },
    ref
  ) => {
    const [paths, setPaths] = useState<SkPath[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [strokeBounds, setStrokeBounds] = useState<StrokeBounds[]>([]);
    const [, setTick] = useState(0);
    const [isScrollEnabled, setIsScrollEnabled] = useState(true);

    const scrollViewRef = useRef<ScrollView>(null);
    const minimumCanvasHeightRef = useRef<number>(Math.max(400, minCanvasHeight));
    const [canvasHeight, setCanvasHeight] = useState<number>(minimumCanvasHeightRef.current);
    const maxY = useRef<number>(0);
    const [scrollOffsetY, setScrollOffsetY] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);

    const livePath = useRef<SkPath>(Skia.Path.Make());
    const livePathFrameRequest = useRef<number | null>(null);
    const livePathSegmentIndexRef = useRef<number>(0);
    const currentPoints = useRef<Point[]>([]);
    const pathsRef = useRef<SkPath[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    const strokeBoundsRef = useRef<StrokeBounds[]>([]);
    const strokesVersionRef = useRef<number>(0);
    const strokesSnapshotCacheRef = useRef<{
      version: number;
      snapshot: Stroke[];
    } | null>(null);

    const lastEraserTime = useRef<number>(0);

    const normalizedPenStrokeWidth = useMemo(
      () => normalizeStrokeWidth(strokeWidth),
      [strokeWidth]
    );

    const setCanvasHeightValue = useCallback(
      (nextHeight: number) => {
        const normalized = Math.max(minimumCanvasHeightRef.current, nextHeight);
        setCanvasHeight((prev) => {
          if (prev === normalized) {
            return prev;
          }
          onCanvasHeightChange?.(normalized);
          return normalized;
        });
      },
      [onCanvasHeightChange]
    );

    const resetCanvasHeight = useCallback(() => {
      setCanvasHeightValue(minimumCanvasHeightRef.current);
    }, [setCanvasHeightValue]);

    const buildPathsFromStrokes = useCallback(
      (nextStrokes: Stroke[]) => nextStrokes.map((stroke) => buildSmoothPath(stroke.points)),
      []
    );

    const syncCanvasHeightFromStrokes = useCallback(
      (nextStrokes: Stroke[]) => {
        if (nextStrokes.length === 0) {
          maxY.current = 0;
          resetCanvasHeight();
          return;
        }

        const nextMaxY = getMaxYFromStrokes(nextStrokes);
        maxY.current = nextMaxY;
        setCanvasHeightValue(nextMaxY + 200);
      },
      [resetCanvasHeight, setCanvasHeightValue]
    );

    const applyStrokes = useCallback(
      (nextStrokes: Stroke[], emitChange = true) => {
        const copied = deepCopyStrokes(nextStrokes);
        const nextPaths = buildPathsFromStrokes(copied);
        const nextBounds = copied.map((stroke) => getStrokeBounds(stroke.points));
        strokesRef.current = copied;
        strokeBoundsRef.current = nextBounds;
        strokesVersionRef.current += 1;
        strokesSnapshotCacheRef.current = null;
        pathsRef.current = nextPaths;
        setStrokes(copied);
        setStrokeBounds(nextBounds);
        setPaths(nextPaths);
        syncCanvasHeightFromStrokes(copied);

        if (emitChange) {
          onChange?.(copied);
        }
      },
      [buildPathsFromStrokes, onChange, syncCanvasHeightFromStrokes]
    );

    const renderLivePathNow = useCallback(() => {
      const points = currentPoints.current;
      if (points.length <= 1) {
        setTick((t) => t + 1);
        return;
      }

      if (points.length <= LIVE_FULL_REBUILD_POINT_THRESHOLD) {
        livePath.current = buildSmoothPath(points);
        livePathSegmentIndexRef.current = Math.max(0, points.length - 1);
        setTick((t) => t + 1);
        return;
      }

      let requiresFallbackRebuild = false;

      while (livePathSegmentIndexRef.current < points.length - 1) {
        const didAppend = appendLiveSmoothSegment(
          livePath.current,
          points,
          livePathSegmentIndexRef.current
        );
        livePathSegmentIndexRef.current += 1;

        if (!didAppend) {
          requiresFallbackRebuild = true;
          break;
        }
      }

      if (requiresFallbackRebuild) {
        livePath.current = buildSmoothPath(points);
        livePathSegmentIndexRef.current = Math.max(0, points.length - 1);
      }

      setTick((t) => t + 1);
    }, []);

    const cancelScheduledLivePathRender = useCallback(() => {
      if (livePathFrameRequest.current === null) {
        return;
      }
      cancelAnimationFrame(livePathFrameRequest.current);
      livePathFrameRequest.current = null;
    }, []);

    const scheduleLivePathRender = useCallback(() => {
      if (livePathFrameRequest.current !== null) {
        return;
      }

      livePathFrameRequest.current = requestAnimationFrame(() => {
        livePathFrameRequest.current = null;
        renderLivePathNow();
      });
    }, [renderLivePathNow]);

    const startStroke = useCallback(
      (x: number, y: number) => {
        currentPoints.current = [{ x, y }];
        livePathSegmentIndexRef.current = 0;
        livePath.current.reset();
        livePath.current.moveTo(x, y);
        cancelScheduledLivePathRender();
        setTick((t) => t + 1);

        if (y > maxY.current) {
          maxY.current = y;
          setCanvasHeightValue(y + 200);
        }
      },
      [cancelScheduledLivePathRender, setCanvasHeightValue]
    );

    const addPoint = useCallback(
      (x: number, y: number) => {
        appendPointWithInterpolation(
          currentPoints.current,
          { x, y },
          resolveMaxPointGap(normalizedPenStrokeWidth)
        );
        scheduleLivePathRender();

        if (y > maxY.current) {
          maxY.current = y;
          setCanvasHeightValue(y + 200);
        }
      },
      [normalizedPenStrokeWidth, scheduleLivePathRender, setCanvasHeightValue]
    );

    const finalizeStroke = useCallback(() => {
      cancelScheduledLivePathRender();

      if (currentPoints.current.length === 0) {
        livePath.current.reset();
        return;
      }

      const pointsToFinalize = [...currentPoints.current];
      const newStroke: Stroke = {
        points: pointsToFinalize,
        color: strokeColor,
        width: normalizedPenStrokeWidth,
      };
      const nextStrokes = [...strokesRef.current, newStroke];
      const newPath = buildSmoothPath(pointsToFinalize);
      const newBounds = getStrokeBounds(pointsToFinalize);
      const nextPaths = [...pathsRef.current, newPath];
      const nextBounds = [...strokeBoundsRef.current, newBounds];

      strokesRef.current = nextStrokes;
      strokeBoundsRef.current = nextBounds;
      strokesVersionRef.current += 1;
      strokesSnapshotCacheRef.current = null;
      pathsRef.current = nextPaths;
      setStrokes(nextStrokes);
      setStrokeBounds(nextBounds);
      setPaths(nextPaths);
      onChange?.(nextStrokes);

      const strokeMaxY = getMaxYFromPoints(pointsToFinalize);
      if (strokeMaxY > maxY.current) {
        maxY.current = strokeMaxY;
        setCanvasHeightValue(strokeMaxY + 200);
      }

      currentPoints.current = [];
      livePath.current.reset();
      livePathSegmentIndexRef.current = 0;
    }, [
      cancelScheduledLivePathRender,
      normalizedPenStrokeWidth,
      onChange,
      setCanvasHeightValue,
      strokeColor,
    ]);

    const eraseAtPoint = useCallback(
      (x: number, y: number) => {
        const now = Date.now();
        if (now - lastEraserTime.current < ERASER_THROTTLE_MS) {
          return;
        }

        lastEraserTime.current = now;

        const thresholdSquared = eraserSize * eraserSize;
        const prevStrokes = strokesRef.current;
        const prevBounds = strokeBoundsRef.current;
        const prevPaths = pathsRef.current;
        const nextStrokes: Stroke[] = [];
        const nextBounds: StrokeBounds[] = [];
        const nextPaths: SkPath[] = [];

        for (let i = 0; i < prevStrokes.length; i++) {
          const stroke = prevStrokes[i];
          const bounds = prevBounds[i];
          const path = prevPaths[i];

          if (bounds && !isPointNearBounds(x, y, eraserSize, bounds)) {
            nextStrokes.push(stroke);
            nextBounds.push(bounds);
            if (path) {
              nextPaths.push(path);
            }
            continue;
          }

          let isTouched = false;
          for (let j = 0; j < stroke.points.length; j++) {
            const point = stroke.points[j];
            const dx = point.x - x;
            const dy = point.y - y;
            if (dx * dx + dy * dy < thresholdSquared) {
              isTouched = true;
              break;
            }
          }

          if (!isTouched) {
            nextStrokes.push(stroke);
            nextBounds.push(bounds ?? getStrokeBounds(stroke.points));
            if (path) {
              nextPaths.push(path);
            }
          }
        }

        if (nextStrokes.length === prevStrokes.length) {
          return;
        }

        strokesRef.current = nextStrokes;
        strokeBoundsRef.current = nextBounds;
        strokesVersionRef.current += 1;
        strokesSnapshotCacheRef.current = null;
        pathsRef.current = nextPaths;
        setStrokes(nextStrokes);
        setStrokeBounds(nextBounds);
        setPaths(nextPaths);
        syncCanvasHeightFromStrokes(nextStrokes);
        onChange?.(nextStrokes);
      },
      [eraserSize, onChange, syncCanvasHeightFromStrokes]
    );

    const startEraser = useCallback(
      (x: number, y: number) => {
        eraseAtPoint(x, y);
      },
      [eraseAtPoint]
    );

    const addEraserPoint = useCallback(
      (x: number, y: number) => {
        eraseAtPoint(x, y);
      },
      [eraseAtPoint]
    );

    const setStrokesFromOutside = useCallback(
      (nextStrokes: Stroke[]) => {
        cancelScheduledLivePathRender();
        currentPoints.current = [];
        livePath.current.reset();
        livePathSegmentIndexRef.current = 0;

        applyStrokes(nextStrokes, true);
      },
      [applyStrokes, cancelScheduledLivePathRender]
    );

    const clear = useCallback(() => {
      setStrokesFromOutside([]);
    }, [setStrokesFromOutside]);

    const getStrokes = useCallback(() => {
      const version = strokesVersionRef.current;
      const cached = strokesSnapshotCacheRef.current;
      if (cached && cached.version === version) {
        return cached.snapshot;
      }

      const snapshot = deepCopyStrokes(strokesRef.current);
      strokesSnapshotCacheRef.current = { version, snapshot };
      return snapshot;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        clear,
        scrollTo: (y: number, animated = true) => {
          scrollViewRef.current?.scrollTo({ y: Math.max(0, y), animated });
        },
        getStrokes,
        setStrokes: setStrokesFromOutside,
        getTexts: () => [],
        setTexts: () => {},
      }),
      [clear, getStrokes, setStrokesFromOutside]
    );

    const pan = useMemo(
      () =>
        Gesture.Pan()
          .maxPointers(1)
          .averageTouches(true)
          .minDistance(PAN_MIN_DISTANCE)
          .onBegin(() => {
            'worklet';
            runOnJS(setIsScrollEnabled)(false);
          })
          .onStart((e) => {
            'worklet';

            if (eraserMode) {
              runOnJS(startEraser)(e.x, e.y);
              return;
            }

            runOnJS(startStroke)(e.x, e.y);
          })
          .onUpdate((e) => {
            'worklet';

            if (eraserMode) {
              runOnJS(addEraserPoint)(e.x, e.y);
              return;
            }

            runOnJS(addPoint)(e.x, e.y);
          })
          .onEnd(() => {
            'worklet';
            if (eraserMode) {
              return;
            }
            runOnJS(finalizeStroke)();
          })
          .onFinalize(() => {
            'worklet';
            runOnJS(setIsScrollEnabled)(true);
          }),
      [addEraserPoint, addPoint, eraserMode, finalizeStroke, startEraser, startStroke]
    );

    const renderedPaths = useMemo(() => {
      if (paths.length >= PICTURE_CACHE_STROKE_THRESHOLD) {
        return null;
      }

      const visibleStart = Math.max(0, scrollOffsetY - VISIBLE_STROKE_MARGIN);
      const visibleEnd = scrollOffsetY + viewportHeight + VISIBLE_STROKE_MARGIN;
      const shouldCull = viewportHeight > 0;

      return paths.map((path, index) => {
        const stroke = strokes[index];
        const bounds = strokeBounds[index];
        if (shouldCull && bounds) {
          const isVisible = bounds.maxY >= visibleStart && bounds.minY <= visibleEnd;
          if (!isVisible) {
            return null;
          }
        }
        return (
          <Path
            key={`path-${index}`}
            path={path}
            style='stroke'
            strokeWidth={normalizeStrokeWidth(stroke?.width ?? normalizedPenStrokeWidth)}
            color={stroke?.color ?? strokeColor}
            strokeCap={stroke?.strokeCap ?? 'round'}
            strokeJoin='round'
            opacity={stroke?.opacity ?? 1}
            antiAlias
          />
        );
      });
    }, [
      normalizedPenStrokeWidth,
      paths,
      scrollOffsetY,
      strokeBounds,
      strokeColor,
      strokes,
      viewportHeight,
    ]);

    const committedPicture = useMemo(
      () =>
        paths.length >= PICTURE_CACHE_STROKE_THRESHOLD
          ? createCommittedPicture(paths, strokes)
          : null,
      [paths, strokes]
    );

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setScrollOffsetY(offsetY);
        onScrollOffsetChange?.(offsetY);
      },
      [onScrollOffsetChange]
    );

    const handleScrollLayout = useCallback((event: LayoutChangeEvent) => {
      setViewportHeight(event.nativeEvent.layout.height);
    }, []);

    useEffect(() => {
      const normalizedMinHeight = Math.max(400, minCanvasHeight);
      minimumCanvasHeightRef.current = normalizedMinHeight;

      if (canvasHeight < normalizedMinHeight) {
        setCanvasHeightValue(normalizedMinHeight);
        return;
      }

      onCanvasHeightChange?.(canvasHeight);
    }, [canvasHeight, minCanvasHeight, onCanvasHeightChange, setCanvasHeightValue]);

    useEffect(() => {
      return () => {
        cancelScheduledLivePathRender();
      };
    }, [cancelScheduledLivePathRender]);

    return (
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onLayout={handleScrollLayout}
          scrollEnabled={isScrollEnabled}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled>
          <GestureDetector gesture={pan}>
            <View style={[styles.canvasWrapper, { height: canvasHeight }]}>
              <Canvas style={styles.canvas}>
                {committedPicture ? <Picture picture={committedPicture} /> : renderedPaths}
                {currentPoints.current.length > 0 && (
                  <Path
                    path={livePath.current}
                    style='stroke'
                    strokeWidth={normalizedPenStrokeWidth}
                    color={strokeColor}
                    strokeCap='round'
                    strokeJoin='round'
                    antiAlias
                  />
                )}
              </Canvas>
            </View>
          </GestureDetector>
        </ScrollView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  canvasWrapper: {
    width: '100%',
  },
  canvas: {
    flex: 1,
  },
});

export default React.memo(DrawingCanvas);
