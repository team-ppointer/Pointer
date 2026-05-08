import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Path, type SkPath, Skia, Circle, Group } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, PointerType } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import { buildSmoothPath } from './smoothing';
import {
  type Point,
  type Stroke,
  type StrokeBounds,
  type DocumentSnapshot,
  type DrawingCanvasRef,
  type DrawingCanvasProps,
} from './model/drawingTypes';
import { computeStrokeBounds, safeMax } from './model/strokeUtils';
import { HistoryManager } from './engine/HistoryManager';
import { SkiaDrawingCanvasSurface } from './render/skia/SkiaDrawingCanvasSurface';
import { useSkiaDrawingRenderer } from './render/skia/useSkiaDrawingRenderer';

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      strokeColor = 'black',
      strokeWidth = 3,
      onChange,
      onHistoryChange,
      eraserMode = false,
      eraserSize = 20,
    },
    ref
  ) => {
    const [paths, setPaths] = useState<SkPath[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [, setTick] = useState(0);
    const canvasHeight = useRef<number>(800);
    const maxY = useRef<number>(0);

    const hoverX = useSharedValue(0);
    const hoverY = useSharedValue(0);
    const showHover = useSharedValue(false);
    const isActiveGesture = useSharedValue(false);

    const livePath = useRef<SkPath>(Skia.Path.Make());
    const currentPoints = useRef<Point[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    /** stroke와 동일 인덱스로 incremental 관리. createSnapshot N×P 재계산 회피. */
    const strokeBoundsRef = useRef<StrokeBounds[]>([]);
    const eraserPoints = useRef<Point[]>([]);
    const lastEraserTime = useRef<number>(0);
    const eraserDidModify = useRef<boolean>(false);
    const ERASER_THROTTLE_MS = 16; // ~60fps

    // 히스토리 매니저 — lazy init (StrictMode 더블 렌더 시 한 번만 생성)
    const historyManagerRef = useRef<HistoryManager | null>(null);
    historyManagerRef.current ??= new HistoryManager(50);
    const historyManager = historyManagerRef.current;

    useEffect(() => {
      if (!onHistoryChange) {
        historyManager.setListener(null);
        return;
      }
      historyManager.setListener(({ canUndo, canRedo }) => {
        onHistoryChange(canUndo, canRedo);
      });
    }, [historyManager, onHistoryChange]);

    /** 현재 stroke 상태의 경량 스냅샷. bounds는 ref incremental 결과 사용. */
    const createSnapshot = useCallback(
      (): DocumentSnapshot => ({
        strokes: strokesRef.current,
        bounds: [...strokeBoundsRef.current],
      }),
      []
    );

    const applySnapshot = useCallback(
      (snapshot: DocumentSnapshot) => {
        const restoredStrokes = [...snapshot.strokes];
        const newPaths = restoredStrokes.map((stroke) => buildSmoothPath(stroke.points));

        setStrokes(restoredStrokes);
        setPaths(newPaths);
        strokesRef.current = restoredStrokes;
        strokeBoundsRef.current = [...snapshot.bounds];

        if (snapshot.strokes.length > 0) {
          const strokesMaxY = safeMax(
            snapshot.strokes.flatMap((stroke) => stroke.points.map((p) => p.y))
          );
          maxY.current = strokesMaxY;
          canvasHeight.current = Math.max(800, strokesMaxY + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        onChange?.(restoredStrokes);
      },
      [onChange]
    );

    const loadStrokes = useCallback(
      (newStrokes: Stroke[]) => {
        const newPaths = newStrokes.map((stroke) => buildSmoothPath(stroke.points));
        const newBounds = newStrokes.map((stroke) => computeStrokeBounds(stroke.points));
        setStrokes(newStrokes);
        setPaths(newPaths);
        strokesRef.current = newStrokes;
        strokeBoundsRef.current = newBounds;

        if (newStrokes.length > 0) {
          const maxYValue = safeMax(newStrokes.flatMap((stroke) => stroke.points.map((p) => p.y)));
          maxY.current = maxYValue;
          canvasHeight.current = Math.max(800, maxYValue + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        onChange?.(newStrokes);
        historyManager.clear();
      },
      [onChange, historyManager]
    );

    const addPoint = useCallback((x: number, y: number) => {
      currentPoints.current.push({ x, y });
      livePath.current = buildSmoothPath(currentPoints.current);

      if (y > maxY.current) {
        maxY.current = y;
        canvasHeight.current = Math.max(800, maxY.current + 200);
      }
      setTick((t) => t + 1);
    }, []);

    const startStroke = useCallback((x: number, y: number) => {
      currentPoints.current = [{ x, y }];
      livePath.current = buildSmoothPath(currentPoints.current);
      setTick((t) => t + 1);
    }, []);

    const finalizeStroke = useCallback(() => {
      if (currentPoints.current.length === 0) {
        livePath.current.reset();
        setTick((t) => t + 1);
        return;
      }

      const pointsToFinalize = [...currentPoints.current];
      const strokeMaxY = safeMax(pointsToFinalize.map((p) => p.y));
      if (strokeMaxY > maxY.current) {
        maxY.current = strokeMaxY;
        canvasHeight.current = Math.max(800, maxY.current + 200);
      }

      const newPath = buildSmoothPath(pointsToFinalize);
      const strokeData: Stroke = {
        points: pointsToFinalize,
        color: strokeColor,
        width: strokeWidth,
      };
      const bounds = computeStrokeBounds(strokeData.points);
      const nextStrokes = [...strokesRef.current, strokeData];

      strokesRef.current = nextStrokes;
      strokeBoundsRef.current.push(bounds);
      setStrokes(nextStrokes);
      setPaths((prev) => [...prev, newPath]);

      currentPoints.current = [];
      livePath.current.reset();

      onChange?.(nextStrokes);
      historyManager.push({ type: 'append-stroke', stroke: strokeData, bounds });
    }, [strokeColor, strokeWidth, onChange, historyManager]);

    const eraseAtPoint = useCallback(
      (x: number, y: number) => {
        const now = Date.now();
        if (now - lastEraserTime.current < ERASER_THROTTLE_MS) return;
        lastEraserTime.current = now;

        const thresholdSquared = eraserSize * eraserSize;
        const prevStrokes = strokesRef.current;
        const prevBounds = strokeBoundsRef.current;
        const keepMask = prevStrokes.map((stroke) => {
          const isTouched = stroke.points.some((point) => {
            const dx = point.x - x;
            const dy = point.y - y;
            return dx * dx + dy * dy < thresholdSquared;
          });
          return !isTouched;
        });

        if (keepMask.every((keep) => keep)) return;

        const nextStrokes = prevStrokes.filter((_, i) => keepMask[i]);
        const nextBounds = prevBounds.filter((_, i) => keepMask[i]);
        const newPaths = nextStrokes.map((s) => buildSmoothPath(s.points));
        setStrokes(nextStrokes);
        setPaths(newPaths);
        strokesRef.current = nextStrokes;
        strokeBoundsRef.current = nextBounds;
        onChange?.(nextStrokes);
        eraserDidModify.current = true;
      },
      [eraserSize, onChange]
    );

    const addEraserPoint = useCallback(
      (x: number, y: number) => {
        eraserPoints.current.push({ x, y });
        eraseAtPoint(x, y);
      },
      [eraseAtPoint]
    );

    const startEraser = useCallback(
      (x: number, y: number) => {
        eraserPoints.current = [{ x, y }];
        historyManager.beginTransaction(createSnapshot());
        eraseAtPoint(x, y);
      },
      [eraseAtPoint, createSnapshot, historyManager]
    );

    const finalizeEraser = useCallback(() => {
      eraserPoints.current = [];
      if (eraserDidModify.current) {
        historyManager.commitTransaction(createSnapshot());
        eraserDidModify.current = false;
      } else {
        historyManager.discardTransaction();
      }
    }, [createSnapshot, historyManager]);

    const undo = useCallback(() => {
      const entry = historyManager.undo();
      if (!entry) return;

      switch (entry.type) {
        case 'append-stroke': {
          const nextStrokes = strokesRef.current.slice(0, -1);
          strokesRef.current = nextStrokes;
          strokeBoundsRef.current = strokeBoundsRef.current.slice(0, -1);
          setStrokes(nextStrokes);
          setPaths((prev) => prev.slice(0, -1));
          onChange?.(nextStrokes);
          break;
        }
        case 'erase-strokes': {
          applySnapshot(entry.snapshotBefore);
          break;
        }
      }
    }, [historyManager, applySnapshot, onChange]);

    const redo = useCallback(() => {
      const entry = historyManager.redo();
      if (!entry) return;

      switch (entry.type) {
        case 'append-stroke': {
          const nextStrokes = [...strokesRef.current, entry.stroke];
          strokesRef.current = nextStrokes;
          strokeBoundsRef.current.push(entry.bounds);
          setStrokes(nextStrokes);
          setPaths((prev) => [...prev, buildSmoothPath(entry.stroke.points)]);
          onChange?.(nextStrokes);
          break;
        }
        case 'erase-strokes': {
          applySnapshot(entry.snapshotAfter);
          break;
        }
      }
    }, [historyManager, applySnapshot, onChange]);

    useImperativeHandle(ref, () => ({
      clear() {
        setPaths([]);
        setStrokes([]);
        strokesRef.current = [];
        strokeBoundsRef.current = [];
        livePath.current.reset();
        maxY.current = 0;
        canvasHeight.current = 800;
        onChange?.([]);
        historyManager.clear();
      },
      undo,
      redo,
      canUndo: () => historyManager.canUndo(),
      canRedo: () => historyManager.canRedo(),
      getStrokes: () => strokesRef.current,
      setStrokes: loadStrokes,
    }));

    const pan = useMemo(
      () =>
        Gesture.Pan()
          .minPointers(1)
          .maxPointers(1)
          .onBegin((e) => {
            'worklet';
            const pointerType = e.pointerType;
            if (pointerType !== PointerType.STYLUS && pointerType !== PointerType.MOUSE) {
              return;
            }
            isActiveGesture.value = true;
            showHover.value = false;
            if (eraserMode) {
              runOnJS(startEraser)(e.x, e.y);
            } else {
              runOnJS(startStroke)(e.x, e.y);
            }
          })
          .onUpdate((e) => {
            'worklet';
            const pointerType = e.pointerType;
            if (pointerType !== PointerType.STYLUS && pointerType !== PointerType.MOUSE) {
              return;
            }
            if (eraserMode) {
              runOnJS(addEraserPoint)(e.x, e.y);
            } else {
              runOnJS(addPoint)(e.x, e.y);
            }
          })
          .onEnd(() => {
            'worklet';
            if (!isActiveGesture.value) return;
            isActiveGesture.value = false;
            if (eraserMode) {
              runOnJS(finalizeEraser)();
            } else {
              runOnJS(finalizeStroke)();
            }
          })
          .minDistance(1),
      [
        eraserMode,
        startStroke,
        addPoint,
        finalizeStroke,
        startEraser,
        addEraserPoint,
        finalizeEraser,
        isActiveGesture,
        showHover,
      ]
    );

    const hoverGesture = useMemo(
      () =>
        Gesture.Hover()
          .onBegin((e) => {
            'worklet';
            const pointerType = e.pointerType;
            if (pointerType === PointerType.STYLUS || pointerType === PointerType.MOUSE) {
              hoverX.value = e.x;
              hoverY.value = e.y;
              showHover.value = true;
            }
          })
          .onUpdate((e) => {
            'worklet';
            const pointerType = e.pointerType;
            if (pointerType === PointerType.STYLUS || pointerType === PointerType.MOUSE) {
              hoverX.value = e.x;
              hoverY.value = e.y;
              showHover.value = true;
            } else {
              showHover.value = false;
            }
          })
          .onEnd(() => {
            'worklet';
            showHover.value = false;
          })
          .onFinalize(() => {
            'worklet';
            showHover.value = false;
          }),
      [hoverX, hoverY, showHover]
    );

    const composedGesture = useMemo(
      () => Gesture.Simultaneous(pan, hoverGesture),
      [pan, hoverGesture]
    );

    const { renderedPaths, hoverOpacity } = useSkiaDrawingRenderer({
      paths,
      strokes,
      strokeWidth,
      strokeColor,
      showHover,
    });

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}>
        <GestureDetector gesture={composedGesture}>
          <View style={styles.container} collapsable={false}>
            <SkiaDrawingCanvasSurface height={canvasHeight.current}>
              {renderedPaths}
              {currentPoints.current.length > 0 && (
                <Path
                  path={livePath.current}
                  style='stroke'
                  strokeWidth={strokeWidth}
                  color={strokeColor}
                  strokeCap='round'
                  strokeJoin='round'
                />
              )}

              <Group>
                <Circle
                  cx={hoverX}
                  cy={hoverY}
                  r={eraserMode ? eraserSize : strokeWidth / 2}
                  color={eraserMode ? '#e2e2e2' : strokeColor}
                  opacity={hoverOpacity}
                  style='stroke'
                  strokeWidth={1.5}
                />
              </Group>
            </SkiaDrawingCanvasSurface>
          </View>
        </GestureDetector>
      </ScrollView>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: { minHeight: 400, position: 'relative' },
});

export default React.memo(DrawingCanvas);
