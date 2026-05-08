import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Path, type SkPath, Skia, Circle, Group } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, PointerType } from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import { buildSmoothPath, IncrementalPathBuilder } from './smoothing';
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
import { type DrawingInputCallbacks } from './input/inputTypes';
import { useNativeStylusAdapter } from './input/nativeStylusAdapter';
import { useRnghPanAdapter } from './input/rnghPanAdapter';
import { SkiaDrawingCanvasSurface } from './render/skia/SkiaDrawingCanvasSurface';
import { useSkiaDrawingRenderer } from './render/skia/useSkiaDrawingRenderer';
import { type RendererViewport } from './render/rendererTypes';
import { screenToCanvas, transformToMatrix3 } from './transform';
import { useCanvasViewportController } from './canvas/useCanvasViewportController';
import { useCanvasGestureComposer } from './canvas/useCanvasGestureComposer';

const MIN_CANVAS_HEIGHT_FLOOR = 400;
const DEFAULT_MAX_ZOOM_SCALE = 4;

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      strokeColor = 'black',
      strokeWidth = 3,
      onChange,
      onHistoryChange,
      eraserSize = 20,
      activeTool = 'pen',
      enableZoomPan = false,
      maxZoomScale = DEFAULT_MAX_ZOOM_SCALE,
    },
    ref
  ) => {
    const eraserMode = activeTool === 'eraser';

    const [paths, setPaths] = useState<SkPath[]>([]);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [, setTick] = useState(0);
    const maxYRef = useRef<number>(0);

    const hoverX = useSharedValue(0);
    const hoverY = useSharedValue(0);
    const showHover = useSharedValue(false);

    const livePath = useRef<SkPath>(Skia.Path.Make());
    const pathBuilderRef = useRef<IncrementalPathBuilder | null>(null);
    pathBuilderRef.current ??= new IncrementalPathBuilder();
    const pathBuilder = pathBuilderRef.current;
    const currentPoints = useRef<Point[]>([]);
    const strokesRef = useRef<Stroke[]>([]);
    /** stroke와 동일 인덱스로 incremental 관리. createSnapshot N×P 재계산 회피. */
    const strokeBoundsRef = useRef<StrokeBounds[]>([]);
    const eraserPoints = useRef<Point[]>([]);
    const lastEraserTime = useRef<number>(0);
    const eraserDidModify = useRef<boolean>(false);
    const ERASER_THROTTLE_MS = 16; // ~60fps

    // 히스토리 매니저 — lazy init
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

    // 렌더러 viewport (외부에서 사용 안 하지만 viewport controller 시그니처 유지)
    const updateViewport = useCallback((_viewport: RendererViewport) => {
      // PR #305+#306 시점 활용처 0 — 향후 culling 등에 사용
    }, []);

    // viewport controller — zoom/pan + canvas height 관리
    const viewport = useCanvasViewportController({
      minCanvasHeight: MIN_CANVAS_HEIGHT_FLOOR,
      enableZoomPan,
      maxZoomScale,
      maxYRef,
      updateViewport,
    });

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
          viewport.syncCanvasHeightFromMaxY(strokesMaxY);
        } else {
          viewport.syncCanvasHeightFromMaxY(0);
        }

        onChange?.(restoredStrokes);
      },
      [onChange, viewport]
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
          viewport.syncCanvasHeightFromMaxY(maxYValue);
        } else {
          viewport.syncCanvasHeightFromMaxY(0);
        }

        onChange?.(newStrokes);
        historyManager.clear();
      },
      [onChange, historyManager, viewport]
    );

    const addPoint = useCallback(
      (x: number, y: number) => {
        currentPoints.current.push({ x, y });
        livePath.current = pathBuilder.update(currentPoints.current);
        viewport.maybeGrowCanvasHeight(y);
        setTick((t) => t + 1);
      },
      [pathBuilder, viewport]
    );

    const startStroke = useCallback(
      (x: number, y: number) => {
        currentPoints.current = [{ x, y }];
        pathBuilder.reset();
        livePath.current = pathBuilder.update(currentPoints.current);
        setTick((t) => t + 1);
      },
      [pathBuilder]
    );

    const finalizeStroke = useCallback(() => {
      if (currentPoints.current.length === 0) {
        livePath.current.reset();
        pathBuilder.reset();
        setTick((t) => t + 1);
        return;
      }

      const pointsToFinalize = [...currentPoints.current];
      const strokeMaxY = safeMax(pointsToFinalize.map((p) => p.y));
      viewport.maybeGrowCanvasHeight(strokeMaxY);

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
      pathBuilder.reset();

      onChange?.(nextStrokes);
      historyManager.push({ type: 'append-stroke', stroke: strokeData, bounds });
    }, [strokeColor, strokeWidth, onChange, historyManager, pathBuilder, viewport]);

    const cancelStroke = useCallback(() => {
      currentPoints.current = [];
      livePath.current.reset();
      pathBuilder.reset();
      setTick((t) => t + 1);
    }, [pathBuilder]);

    const eraseAtPoint = useCallback(
      (x: number, y: number) => {
        const now = Date.now();
        if (now - lastEraserTime.current < ERASER_THROTTLE_MS) return;
        lastEraserTime.current = now;

        const thresholdSquared = eraserSize * eraserSize;
        const prevStrokes = strokesRef.current;
        const prevBounds = strokeBoundsRef.current;
        const keepMask = prevStrokes.map((stroke, i) => {
          // AABB 사전 검사: bounds + eraserSize 영역 밖이면 무조건 keep (점 검사 skip)
          const b = prevBounds[i];
          if (
            x < b.minX - eraserSize ||
            x > b.maxX + eraserSize ||
            y < b.minY - eraserSize ||
            y > b.maxY + eraserSize
          ) {
            return true;
          }
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
        pathBuilder.reset();
        viewport.syncCanvasHeightFromMaxY(0);
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

    // zoom 활성화 시 stylus 입력 좌표는 screen → canvas 변환 필요
    const transformInputToCanvas = useCallback(
      (sx: number, sy: number): { x: number; y: number } => {
        if (!enableZoomPan) return { x: sx, y: sy };
        const t = viewport.viewTransform.value;
        if (t.scale === 1 && t.translateX === 0 && t.translateY === 0) {
          return { x: sx, y: sy };
        }
        return screenToCanvas(sx, sy, t);
      },
      [enableZoomPan, viewport.viewTransform]
    );

    const drawingCallbacks = useMemo<DrawingInputCallbacks>(
      () => ({
        onInteractionBegin: () => {
          showHover.value = false;
        },
        onInteractionFinalize: () => {
          if (eraserMode) {
            finalizeEraser();
          }
        },
        onDrawStart: (input) => {
          const c = transformInputToCanvas(input.x, input.y);
          startStroke(c.x, c.y);
        },
        onDrawMove: (input) => {
          const c = transformInputToCanvas(input.x, input.y);
          addPoint(c.x, c.y);
        },
        onDrawEnd: () => finalizeStroke(),
        onDrawCancel: () => cancelStroke(),
        onEraseStart: (input) => {
          const c = transformInputToCanvas(input.x, input.y);
          startEraser(c.x, c.y);
        },
        onEraseMove: (input) => {
          const c = transformInputToCanvas(input.x, input.y);
          addEraserPoint(c.x, c.y);
        },
      }),
      [
        showHover,
        eraserMode,
        startStroke,
        addPoint,
        finalizeStroke,
        cancelStroke,
        startEraser,
        addEraserPoint,
        finalizeEraser,
        transformInputToCanvas,
      ]
    );

    // iOS: native UIPencil 입력 (240Hz coalesced + predicted touches). rngh pan 비활성화.
    const useNativeStylus = Platform.OS === 'ios';

    const inputAdapter = useRnghPanAdapter({
      eraserMode,
      pencilOnly: true,
      minDistance: 1,
      callbacks: drawingCallbacks,
      enabled: !useNativeStylus,
    });

    const nativeStylusAdapter = useNativeStylusAdapter({
      eraserMode,
      callbacks: drawingCallbacks,
    });

    // hover gesture (zoom 비활성 시만; zoom 시 finger 게스처가 hover 차단)
    const hoverGesture = useMemo(
      () =>
        Gesture.Hover()
          .enabled(!enableZoomPan)
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
      [hoverX, hoverY, showHover, enableZoomPan]
    );

    // gesture composer: zoom 활성 시 pinch/finger pan 추가
    const { composedGesture: zoomComposed } = useCanvasGestureComposer({
      enableZoomPan,
      maxZoomScale,
      nativeFingerInput: useNativeStylus,
      viewTransform: viewport.viewTransform,
      viewportWidthShared: viewport.viewportWidthShared,
      viewportHeightShared: viewport.viewportHeightShared,
      canvasHeightShared: viewport.canvasHeightShared,
      drawPanGesture: inputAdapter.gesture,
    });

    const composedGesture = useMemo(
      () => Gesture.Simultaneous(zoomComposed, hoverGesture),
      [zoomComposed, hoverGesture]
    );

    // Skia matrix prop — SharedValue 자동 감지 (UI thread 업데이트 그대로 반영)
    const skiaMatrix = useDerivedValue(() => transformToMatrix3(viewport.viewTransform.value));

    const { renderedPaths, hoverOpacity } = useSkiaDrawingRenderer({
      paths,
      strokes,
      strokeWidth,
      strokeColor,
      showHover,
    });

    return (
      <ScrollView
        ref={viewport.scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        scrollEnabled={!enableZoomPan}
        onScroll={viewport.handleScroll}
        scrollEventThrottle={16}>
        <GestureDetector gesture={composedGesture}>
          <View style={styles.container} collapsable={false} onLayout={viewport.handleLayout}>
            <SkiaDrawingCanvasSurface height={viewport.canvasHeight}>
              <Group matrix={skiaMatrix}>
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
              </Group>

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
            {nativeStylusAdapter?.overlay}
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
