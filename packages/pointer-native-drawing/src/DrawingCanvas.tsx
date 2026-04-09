import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import type {
  InputEvent,
  Stroke,
  WritingFeelConfig,
} from "./model/drawingTypes";
import { normalizeStrokeWidth } from "./model/strokeUtils";
import { DEFAULT_WRITING_FEEL_CONFIG } from "./model/writingFeel";
import { DrawingEngine } from "./engine/DrawingEngine";
import { useRnghPanAdapter } from "./input/rnghPanAdapter";
import { useNativeStylusAdapter } from "./input/nativeStylusAdapter";
import { SkiaDrawingCanvasSurface } from "./render/skia/SkiaDrawingCanvasSurface";
import { useSkiaDrawingRenderer } from "./render/skia/useSkiaDrawingRenderer";

export type DrawingCanvasRef = {
  clear: () => void;
  scrollTo: (y: number, animated?: boolean) => void;
  getStrokes: () => Stroke[];
  setStrokes: (strokes: Stroke[]) => void;
};

export type DrawingCanvasProps = {
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  onChange?: (strokes: Stroke[]) => void;
  onScrollOffsetChange?: (offsetY: number) => void;
  onCanvasHeightChange?: (height: number) => void;
  eraserMode?: boolean;
  eraserSize?: number;
  minCanvasHeight?: number;
  writingFeelConfig?: WritingFeelConfig;
  stylusInput?: "auto" | "native" | "rngh";
  children?: React.ReactNode;
};

const PAN_MIN_DISTANCE = 0.12;

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      strokeColor = "#1E1E21",
      strokeWidth = 3,
      backgroundColor = "#fff",
      onChange,
      onScrollOffsetChange,
      onCanvasHeightChange,
      eraserMode = false,
      eraserSize = 20,
      minCanvasHeight = 800,
      writingFeelConfig = DEFAULT_WRITING_FEEL_CONFIG,
      stylusInput = "auto",
      children,
    },
    ref,
  ) => {
    const [isScrollEnabled, setIsScrollEnabled] = useState(true);

    const scrollViewRef = useRef<ScrollView>(null);
    const minimumCanvasHeightRef = useRef<number>(
      Math.max(400, minCanvasHeight),
    );
    const [canvasHeight, setCanvasHeight] = useState<number>(
      minimumCanvasHeightRef.current,
    );
    const maxY = useRef<number>(0);

    const onChangeRef = useRef(onChange);
    const onCanvasHeightChangeRef = useRef(onCanvasHeightChange);
    const onScrollOffsetChangeRef = useRef(onScrollOffsetChange);
    const strokeColorRef = useRef(strokeColor);
    const eraserSizeRef = useRef(eraserSize);
    onChangeRef.current = onChange;
    onCanvasHeightChangeRef.current = onCanvasHeightChange;
    onScrollOffsetChangeRef.current = onScrollOffsetChange;
    strokeColorRef.current = strokeColor;
    eraserSizeRef.current = eraserSize;

    const engineRef = useRef<DrawingEngine>(new DrawingEngine());
    const [rendererState, rendererActions] = useSkiaDrawingRenderer(writingFeelConfig);
    const { paths, strokes, livePath, isLiveStrokeActive, isLivePathVariableWidth, viewport, canvasRef } = rendererState;
    const {
      startLivePath,
      scheduleLivePathRender,
      cancelScheduledLivePathRender,
      resetLivePath,
      replaceCommittedStrokes,
      appendCommittedStroke,
      retainOrRebuildCommittedStrokes,
      updateViewport,
    } = rendererActions;

    const normalizedPenStrokeWidth = useMemo(
      () => normalizeStrokeWidth(strokeWidth),
      [strokeWidth],
    );

    const setCanvasHeightValue = useCallback(
      (nextHeight: number) => {
        const normalized = Math.max(minimumCanvasHeightRef.current, nextHeight);
        setCanvasHeight((prev) => {
          if (prev === normalized) {
            return prev;
          }
          onCanvasHeightChangeRef.current?.(normalized);
          return normalized;
        });
      },
      [],
    );

    const resetCanvasHeight = useCallback(() => {
      setCanvasHeightValue(minimumCanvasHeightRef.current);
    }, [setCanvasHeightValue]);

    const syncCanvasHeightFromMaxY = useCallback(
      (nextMaxY: number) => {
        if (nextMaxY <= 0) {
          maxY.current = 0;
          resetCanvasHeight();
          return;
        }

        maxY.current = nextMaxY;
        setCanvasHeightValue(nextMaxY + 200);
      },
      [resetCanvasHeight, setCanvasHeightValue],
    );

    const startStroke = useCallback(
      (input: InputEvent) => {
        const result = engineRef.current.startStroke(input);
        startLivePath(input.x, input.y);

        if (result.maxY > maxY.current) {
          maxY.current = result.maxY;
          setCanvasHeightValue(result.maxY + 200);
        }
      },
      [setCanvasHeightValue, startLivePath],
    );

    const addPoint = useCallback(
      (input: InputEvent) => {
        const result = engineRef.current.addPoint(input, {
          strokeWidth: normalizedPenStrokeWidth,
        });
        scheduleLivePathRender(engineRef.current.getSessionSamples());

        if (result.maxY > maxY.current) {
          maxY.current = result.maxY;
          setCanvasHeightValue(result.maxY + 200);
        }
      },
      [normalizedPenStrokeWidth, scheduleLivePathRender, setCanvasHeightValue],
    );

    const finalizeStroke = useCallback(() => {
      cancelScheduledLivePathRender();

      if (engineRef.current.getSessionPoints().length === 0) {
        resetLivePath();
        return;
      }

      const result = engineRef.current.finalizeStroke({
        strokeColor: strokeColorRef.current,
        strokeWidth: normalizedPenStrokeWidth,
      });
      if (!result.changed || !result.appendedStroke) {
        resetLivePath();
        return;
      }

      appendCommittedStroke(
        result.document.strokes,
        result.strokeBounds,
        result.appendedStroke,
      );
      onChangeRef.current?.(engineRef.current.getStrokes());
      syncCanvasHeightFromMaxY(result.maxY);

      resetLivePath();
    }, [
      appendCommittedStroke,
      cancelScheduledLivePathRender,
      normalizedPenStrokeWidth,
      resetLivePath,
      syncCanvasHeightFromMaxY,
    ]);

    const eraseAtPoint = useCallback(
      (input: InputEvent) => {
        const result = engineRef.current.eraseAtPoint(input, {
          eraserSize: eraserSizeRef.current,
        });
        if (!result.changed) {
          return;
        }

        retainOrRebuildCommittedStrokes(
          result.document.strokes,
          result.strokeBounds,
          result.retainedStrokeIndices,
        );
        syncCanvasHeightFromMaxY(result.maxY);
        onChangeRef.current?.(engineRef.current.getStrokes());
      },
      [
        retainOrRebuildCommittedStrokes,
        syncCanvasHeightFromMaxY,
      ],
    );

    const forceCommitActiveSession = useCallback(() => {
      if (!engineRef.current.hasActiveSession()) {
        return;
      }

      cancelScheduledLivePathRender();
      resetLivePath();

      const result = engineRef.current.finalizeStroke({
        strokeColor: strokeColorRef.current,
        strokeWidth: normalizedPenStrokeWidth,
      });
      if (result.changed && result.appendedStroke) {
        appendCommittedStroke(
          result.document.strokes,
          result.strokeBounds,
          result.appendedStroke,
        );
        syncCanvasHeightFromMaxY(result.maxY);
      }
    }, [
      appendCommittedStroke,
      cancelScheduledLivePathRender,
      normalizedPenStrokeWidth,
      resetLivePath,
      syncCanvasHeightFromMaxY,
    ]);

    const cancelDraw = useCallback(() => {
      const sessionPoints = engineRef.current.getSessionPoints();

      if (sessionPoints.length <= 1) {
        cancelScheduledLivePathRender();
        resetLivePath();
        engineRef.current.discardSession();
        return;
      }

      forceCommitActiveSession();
      onChangeRef.current?.(engineRef.current.getStrokes());
    }, [cancelScheduledLivePathRender, forceCommitActiveSession, resetLivePath]);

    const setStrokesFromOutside = useCallback(
      (nextStrokes: Stroke[]) => {
        forceCommitActiveSession();

        const result = engineRef.current.applyStrokes(nextStrokes);
        replaceCommittedStrokes(result.document.strokes, result.strokeBounds);
        syncCanvasHeightFromMaxY(result.maxY);
        onChangeRef.current?.(engineRef.current.getStrokes());
      },
      [
        forceCommitActiveSession,
        replaceCommittedStrokes,
        syncCanvasHeightFromMaxY,
      ],
    );

    const clear = useCallback(() => {
      cancelScheduledLivePathRender();
      resetLivePath();

      if (engineRef.current.hasActiveSession()) {
        engineRef.current.finalizeStroke({
          strokeColor: strokeColorRef.current,
          strokeWidth: normalizedPenStrokeWidth,
        });
      }

      const result = engineRef.current.clear();
      replaceCommittedStrokes(result.document.strokes, result.strokeBounds);
      syncCanvasHeightFromMaxY(result.maxY);
      onChangeRef.current?.(engineRef.current.getStrokes());
    }, [
      cancelScheduledLivePathRender,
      normalizedPenStrokeWidth,
      replaceCommittedStrokes,
      resetLivePath,
      syncCanvasHeightFromMaxY,
    ]);

    const getStrokes = useCallback(() => {
      return engineRef.current.getStrokes();
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
      }),
      [clear, getStrokes, setStrokesFromOutside],
    );

    const inputCallbacks = useMemo(
      () => ({
        onInteractionBegin: () => setIsScrollEnabled(false),
        onInteractionFinalize: () => setIsScrollEnabled(true),
        onDrawStart: startStroke,
        onDrawMove: addPoint,
        onDrawEnd: finalizeStroke,
        onDrawCancel: () => cancelDraw(),
        onEraseStart: eraseAtPoint,
        onEraseMove: eraseAtPoint,
      }),
      [
        addPoint,
        cancelDraw,
        eraseAtPoint,
        finalizeStroke,
        startStroke,
      ],
    );

    const isFabric = !!(globalThis as any).nativeFabricUIManager;
    const useNativeStylus =
      isFabric &&
      (stylusInput === "native" ||
        (stylusInput === "auto" && Platform.OS === "ios"));

    const nativeStylusAdapter = useNativeStylusAdapter({
      callbacks: inputCallbacks,
      eraserMode,
    });

    const { gesture: pan } = useRnghPanAdapter({
      eraserMode,
      minDistance: PAN_MIN_DISTANCE,
      callbacks: inputCallbacks,
    });

    const viewportRef = useRef(viewport);
    viewportRef.current = viewport;

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        updateViewport({ scrollOffsetY: offsetY, viewportHeight: viewportRef.current.viewportHeight });
        onScrollOffsetChangeRef.current?.(offsetY);
      },
      [updateViewport],
    );

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      updateViewport({ scrollOffsetY: viewportRef.current.scrollOffsetY, viewportHeight: event.nativeEvent.layout.height });
    }, [updateViewport]);

    useEffect(() => {
      const normalizedMinHeight = Math.max(400, minCanvasHeight);
      minimumCanvasHeightRef.current = normalizedMinHeight;

      if (canvasHeight < normalizedMinHeight) {
        setCanvasHeightValue(normalizedMinHeight);
        return;
      }

      onCanvasHeightChangeRef.current?.(canvasHeight);
    }, [
      canvasHeight,
      minCanvasHeight,
      setCanvasHeightValue,
    ]);

    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={isScrollEnabled}
          onScroll={handleScroll}
          onLayout={handleLayout}
          scrollEventThrottle={16}
          nestedScrollEnabled
        >
          <GestureDetector gesture={pan}>
            <View style={[styles.canvasWrapper, { height: canvasHeight }]}>
              {children}
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <SkiaDrawingCanvasSurface
                  paths={paths}
                  strokes={strokes}
                  strokeBounds={rendererState.strokeBounds}
                  strokeColor={strokeColor}
                  normalizedPenStrokeWidth={normalizedPenStrokeWidth}
                  livePath={livePath}
                  isLiveStrokeActive={isLiveStrokeActive}
                  isLivePathVariableWidth={isLivePathVariableWidth}
                  canvasRef={canvasRef}
                  scrollOffsetY={viewport.scrollOffsetY}
                  viewportHeight={viewport.viewportHeight}
                />
              </View>
              {useNativeStylus && nativeStylusAdapter?.overlay}
            </View>
          </GestureDetector>
        </ScrollView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  canvasWrapper: {
    width: "100%",
  },
});

export default React.memo(DrawingCanvas);
