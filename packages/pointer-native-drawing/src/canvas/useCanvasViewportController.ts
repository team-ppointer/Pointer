import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import { type ViewTransform, IDENTITY_TRANSFORM, clampTransform } from '../transform';
import { type RendererViewport } from '../render/rendererTypes';

const MIN_CANVAS_HEIGHT_FLOOR = 400;
const CANVAS_HEIGHT_BUFFER = 200;
const ZOOM_CONTENT_HEIGHT_MULTIPLIER = 2;

export type UseCanvasViewportControllerArgs = {
  minCanvasHeight: number;
  enableZoomPan: boolean;
  maxZoomScale: number;
  maxYRef: React.RefObject<number>;
  onCanvasHeightChange?: (height: number) => void;
  onScrollOffsetChange?: (offsetY: number) => void;
  updateViewport: (viewport: RendererViewport) => void;
};

export function useCanvasViewportController({
  minCanvasHeight,
  enableZoomPan,
  maxZoomScale,
  maxYRef,
  onCanvasHeightChange,
  onScrollOffsetChange,
  updateViewport,
}: UseCanvasViewportControllerArgs) {
  // viewTransform: SharedValue — gesture worklet 직접 갱신, Skia matrix prop 자동 감지
  const viewTransform = useSharedValue<ViewTransform>(IDENTITY_TRANSFORM);

  // viewport size — JS state + SharedValue dual (layout은 JS, worklet 사용은 SharedValue)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const viewportWidthShared = useSharedValue(0);
  const viewportHeightShared = useSharedValue(0);

  useEffect(() => {
    viewportWidthShared.value = viewportSize.width;
    viewportHeightShared.value = viewportSize.height;
  }, [viewportSize.width, viewportSize.height, viewportWidthShared, viewportHeightShared]);

  const scrollViewRef = useRef<ScrollView>(null);
  const minimumCanvasHeightRef = useRef<number>(Math.max(MIN_CANVAS_HEIGHT_FLOOR, minCanvasHeight));
  const [canvasHeight, setCanvasHeight] = useState<number>(minimumCanvasHeightRef.current);
  const canvasHeightRef = useRef(canvasHeight);
  canvasHeightRef.current = canvasHeight;

  // Low fix: minCanvasHeight prop sync (첫 렌더 capture 회피)
  useEffect(() => {
    minimumCanvasHeightRef.current = Math.max(MIN_CANVAS_HEIGHT_FLOOR, minCanvasHeight);
  }, [minCanvasHeight]);

  const onCanvasHeightChangeRef = useRef(onCanvasHeightChange);
  const onScrollOffsetChangeRef = useRef(onScrollOffsetChange);
  onCanvasHeightChangeRef.current = onCanvasHeightChange;
  onScrollOffsetChangeRef.current = onScrollOffsetChange;

  // Low fix: setState updater 외부에서 callback 분리 (StrictMode 더블 렌더 안전)
  const setCanvasHeightValue = useCallback((nextHeight: number) => {
    const normalized = Math.max(minimumCanvasHeightRef.current, nextHeight);
    if (normalized === canvasHeightRef.current) return;
    setCanvasHeight(normalized);
    onCanvasHeightChangeRef.current?.(normalized);
  }, []);

  const resetCanvasHeight = useCallback(() => {
    setCanvasHeightValue(minimumCanvasHeightRef.current);
  }, [setCanvasHeightValue]);

  const maybeGrowCanvasHeight = useCallback(
    (nextMaxY: number) => {
      if (nextMaxY > maxYRef.current) {
        maxYRef.current = nextMaxY;
        setCanvasHeightValue(nextMaxY + CANVAS_HEIGHT_BUFFER);
      }
    },
    [setCanvasHeightValue, maxYRef]
  );

  const syncCanvasHeightFromMaxY = useCallback(
    (nextMaxY: number) => {
      if (nextMaxY <= 0) {
        maxYRef.current = 0;
        resetCanvasHeight();
        return;
      }
      maxYRef.current = nextMaxY;
      setCanvasHeightValue(nextMaxY + CANVAS_HEIGHT_BUFFER);
    },
    [resetCanvasHeight, setCanvasHeightValue, maxYRef]
  );

  // zoom 활성화 시 content height = max(canvasHeight, viewportHeight × ZOOM_CONTENT_HEIGHT_MULTIPLIER)
  const effectiveCanvasHeight = enableZoomPan
    ? Math.max(canvasHeight, viewportSize.height * ZOOM_CONTENT_HEIGHT_MULTIPLIER)
    : canvasHeight;

  // canvas height SharedValue (worklet에서 clampTransform 호출용)
  const canvasHeightShared = useSharedValue(canvasHeight);
  useEffect(() => {
    canvasHeightShared.value = effectiveCanvasHeight;
  }, [effectiveCanvasHeight, canvasHeightShared]);

  // applyTransform: JS-side callback. consumer 직접 호출 (e.g. external transform 변경).
  // gesture worklet 안에서는 inline clampTransform + viewTransform.value 갱신 — runOnJS 매 프레임 회피.
  const applyTransform = useCallback(
    (next: ViewTransform) => {
      const clamped = clampTransform(
        next,
        viewportSize.width,
        effectiveCanvasHeight,
        viewportSize.width,
        viewportSize.height,
        maxZoomScale
      );
      viewTransform.value = clamped;
    },
    [viewTransform, viewportSize.width, viewportSize.height, effectiveCanvasHeight, maxZoomScale]
  );

  const viewportRef = useRef<RendererViewport>({ scrollOffsetY: 0, viewportHeight: 0 });

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      updateViewport({
        scrollOffsetY: offsetY,
        viewportHeight: viewportRef.current.viewportHeight,
      });
      viewportRef.current = { ...viewportRef.current, scrollOffsetY: offsetY };
      onScrollOffsetChangeRef.current?.(offsetY);
    },
    [updateViewport]
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setViewportSize((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
      updateViewport({ scrollOffsetY: viewportRef.current.scrollOffsetY, viewportHeight: height });
      viewportRef.current = { ...viewportRef.current, viewportHeight: height };
    },
    [updateViewport]
  );

  return {
    viewTransform,
    viewportWidthShared,
    viewportHeightShared,
    canvasHeightShared,
    viewportSize,
    canvasHeight: effectiveCanvasHeight,
    scrollViewRef,
    setCanvasHeightValue,
    resetCanvasHeight,
    maybeGrowCanvasHeight,
    syncCanvasHeightFromMaxY,
    applyTransform,
    handleScroll,
    handleLayout,
  };
}

export type UseCanvasViewportControllerResult = ReturnType<typeof useCanvasViewportController>;

export type UseCanvasViewportControllerSharedValues = {
  viewTransform: SharedValue<ViewTransform>;
  viewportWidthShared: SharedValue<number>;
  viewportHeightShared: SharedValue<number>;
  canvasHeightShared: SharedValue<number>;
};
