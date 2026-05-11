import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Canvas, Path, type SkPath, Skia, Circle, Group } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, PointerType } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, useDerivedValue } from 'react-native-reanimated';

import { buildSmoothPath } from './smoothing';
import { type Point, type Stroke, type DrawingCanvasRef } from './model/drawingTypes';
import { deepCopyStrokes, safeMax } from './model/strokeUtils';

type Props = {
  strokeColor?: string;
  strokeWidth?: number;
  onChange?: (strokes: Stroke[]) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  eraserMode?: boolean;
  eraserSize?: number;
};

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(
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
    const eraserPoints = useRef<Point[]>([]);
    const lastEraserTime = useRef<number>(0);
    const eraserDidModify = useRef<boolean>(false);
    const ERASER_THROTTLE_MS = 16; // ~60fps

    type HistoryState = { strokes: Stroke[] };
    const historyRef = useRef<HistoryState[]>([]);
    const historyIndexRef = useRef<number>(-1);

    const notifyHistoryChange = useCallback(() => {
      if (!onHistoryChange) return;
      const canUndo =
        historyIndexRef.current > 0 ||
        (historyIndexRef.current === 0 && historyRef.current.length > 1);
      const canRedo = historyIndexRef.current + 1 < historyRef.current.length;
      onHistoryChange(canUndo, canRedo);
    }, [onHistoryChange]);

    const saveToHistory = useCallback(() => {
      const currentState: HistoryState = {
        strokes: deepCopyStrokes(strokesRef.current),
      };

      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(currentState);
      historyIndexRef.current = historyRef.current.length - 1;

      if (historyRef.current.length > 50) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }

      notifyHistoryChange();
    }, [notifyHistoryChange]);

    const restoreFromHistory = useCallback(
      (index: number) => {
        if (index < 0 || index >= historyRef.current.length) return;

        const state = historyRef.current[index];
        const restoredStrokes = deepCopyStrokes(state.strokes);
        const newPaths = restoredStrokes.map((stroke) => buildSmoothPath(stroke.points));

        setStrokes(restoredStrokes);
        setPaths(newPaths);
        strokesRef.current = restoredStrokes;

        if (state.strokes.length > 0) {
          const strokesMaxY = safeMax(
            state.strokes.flatMap((stroke) => stroke.points.map((p) => p.y))
          );
          maxY.current = strokesMaxY;
          canvasHeight.current = Math.max(800, strokesMaxY + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        onChange?.(restoredStrokes);
        notifyHistoryChange();
      },
      [onChange, notifyHistoryChange]
    );

    const loadStrokes = useCallback(
      (newStrokes: Stroke[]) => {
        const newPaths = newStrokes.map((stroke) => buildSmoothPath(stroke.points));
        setStrokes(newStrokes);
        setPaths(newPaths);
        strokesRef.current = newStrokes;

        if (newStrokes.length > 0) {
          const maxYValue = safeMax(newStrokes.flatMap((stroke) => stroke.points.map((p) => p.y)));
          maxY.current = maxYValue;
          canvasHeight.current = Math.max(800, maxYValue + 200);
        } else {
          maxY.current = 0;
          canvasHeight.current = 800;
        }

        onChange?.(newStrokes);

        historyRef.current = [{ strokes: deepCopyStrokes(newStrokes) }];
        historyIndexRef.current = 0;
        notifyHistoryChange();
      },
      [onChange, notifyHistoryChange]
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
      const nextStrokes = [...strokesRef.current, strokeData];

      strokesRef.current = nextStrokes;
      setStrokes(nextStrokes);
      setPaths((prev) => [...prev, newPath]);

      currentPoints.current = [];
      livePath.current.reset();

      onChange?.(nextStrokes);
      saveToHistory();
    }, [strokeColor, strokeWidth, onChange, saveToHistory]);

    const eraseAtPoint = useCallback(
      (x: number, y: number) => {
        const now = Date.now();
        if (now - lastEraserTime.current < ERASER_THROTTLE_MS) return;
        lastEraserTime.current = now;

        const thresholdSquared = eraserSize * eraserSize;
        const prevStrokes = strokesRef.current;
        const nextStrokes = prevStrokes.filter((stroke) => {
          const isTouched = stroke.points.some((point) => {
            const dx = point.x - x;
            const dy = point.y - y;
            return dx * dx + dy * dy < thresholdSquared;
          });
          return !isTouched;
        });

        if (nextStrokes.length !== prevStrokes.length) {
          const newPaths = nextStrokes.map((s) => buildSmoothPath(s.points));
          setStrokes(nextStrokes);
          setPaths(newPaths);
          strokesRef.current = nextStrokes;
          onChange?.(nextStrokes);
          eraserDidModify.current = true;
        }
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
        eraseAtPoint(x, y);
      },
      [eraseAtPoint]
    );

    const finalizeEraser = useCallback(() => {
      eraserPoints.current = [];
      if (eraserDidModify.current) {
        saveToHistory();
        eraserDidModify.current = false;
      }
    }, [saveToHistory]);

    const undo = useCallback(() => {
      if (historyIndexRef.current > 0) {
        historyIndexRef.current--;
        restoreFromHistory(historyIndexRef.current);
      } else if (historyIndexRef.current === 0) {
        historyIndexRef.current = -1;
        restoreFromHistory(0);
      }
    }, [restoreFromHistory]);

    const redo = useCallback(() => {
      const nextIndex = historyIndexRef.current + 1;
      if (nextIndex < historyRef.current.length) {
        historyIndexRef.current = nextIndex;
        restoreFromHistory(nextIndex);
      }
    }, [restoreFromHistory]);

    useImperativeHandle(ref, () => ({
      clear() {
        setPaths([]);
        setStrokes([]);
        strokesRef.current = [];
        livePath.current.reset();
        maxY.current = 0;
        canvasHeight.current = 800;
        onChange?.([]);

        historyRef.current = [];
        historyIndexRef.current = -1;
        notifyHistoryChange();
      },
      undo,
      redo,
      canUndo: () => {
        if (historyIndexRef.current > 0) return true;
        if (historyRef.current.length === 1) return false;
        return historyIndexRef.current === 0 && historyRef.current.length > 1;
      },
      canRedo: () => historyIndexRef.current + 1 < historyRef.current.length,
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

    const hoverOpacity = useDerivedValue(() => {
      return showHover.value ? 0.6 : 0;
    }, [showHover]);

    const composedGesture = useMemo(
      () => Gesture.Simultaneous(pan, hoverGesture),
      [pan, hoverGesture]
    );

    const renderedPaths = useMemo(
      () =>
        paths.map((p, i) => {
          const stroke = strokes[i];
          return (
            <Path
              key={`path-${i}`}
              path={p}
              style='stroke'
              strokeWidth={stroke?.width || strokeWidth}
              color={stroke?.color || strokeColor}
              strokeCap='round'
              strokeJoin='round'
            />
          );
        }),
      [paths, strokes, strokeWidth, strokeColor]
    );

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}>
        <GestureDetector gesture={composedGesture}>
          <View style={styles.container} collapsable={false}>
            <Canvas style={[styles.canvas, { height: canvasHeight.current }]}>
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
            </Canvas>
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
  canvas: { width: '100%', backgroundColor: 'transparent' },
});

export default React.memo(DrawingCanvas);
