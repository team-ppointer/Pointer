import { useCallback, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';

import type { ViewTransform } from '../transform';
import { IDENTITY_TRANSFORM, clampTransform } from '../transform';
import type { RendererViewport } from '../render/rendererTypes';

export type UseCanvasViewportControllerArgs = {
  minCanvasHeight: number;
  enableZoomPan: boolean;
  maxZoomScale: number;
  maxYRef: RefObject<number>;
  onCanvasHeightChange?: (height: number) => void;
  onScrollOffsetChange?: (offsetY: number) => void;
  onTransformChange?: (t: ViewTransform) => void;
  updateViewport: (viewport: RendererViewport) => void;
};

export function useCanvasViewportController({
  minCanvasHeight,
  enableZoomPan,
  maxZoomScale,
  maxYRef,
  onCanvasHeightChange,
  onScrollOffsetChange,
  onTransformChange,
  updateViewport,
}: UseCanvasViewportControllerArgs) {
  // --- Transform state ---
  const [viewTransform, setViewTransform] = useState<ViewTransform>(IDENTITY_TRANSFORM);
  const viewTransformRef = useRef<ViewTransform>(IDENTITY_TRANSFORM);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // --- Canvas height state ---
  const scrollViewRef = useRef<ScrollView>(null);
  const minimumCanvasHeightRef = useRef<number>(Math.max(400, minCanvasHeight));
  const [canvasHeight, setCanvasHeight] = useState<number>(minimumCanvasHeightRef.current);

  // Stable refs for callbacks
  const onCanvasHeightChangeRef = useRef(onCanvasHeightChange);
  const onScrollOffsetChangeRef = useRef(onScrollOffsetChange);
  const onTransformChangeRef = useRef(onTransformChange);
  onCanvasHeightChangeRef.current = onCanvasHeightChange;
  onScrollOffsetChangeRef.current = onScrollOffsetChange;
  onTransformChangeRef.current = onTransformChange;

  // --- Height helpers ---

  const setCanvasHeightValue = useCallback((nextHeight: number) => {
    const normalized = Math.max(minimumCanvasHeightRef.current, nextHeight);
    setCanvasHeight((prev) => {
      if (prev === normalized) return prev;
      onCanvasHeightChangeRef.current?.(normalized);
      return normalized;
    });
  }, []);

  const resetCanvasHeight = useCallback(() => {
    setCanvasHeightValue(minimumCanvasHeightRef.current);
  }, [setCanvasHeightValue]);

  const maybeGrowCanvasHeight = useCallback(
    (nextMaxY: number) => {
      if (nextMaxY > maxYRef.current) {
        maxYRef.current = nextMaxY;
        setCanvasHeightValue(nextMaxY + Math.max(200, viewportSize.height));
      }
    },
    [setCanvasHeightValue, viewportSize.height]
  );

  const syncCanvasHeightFromMaxY = useCallback(
    (nextMaxY: number) => {
      if (nextMaxY <= 0) {
        maxYRef.current = 0;
        resetCanvasHeight();
        return;
      }
      maxYRef.current = nextMaxY;
      setCanvasHeightValue(nextMaxY + Math.max(200, viewportSize.height));
    },
    [resetCanvasHeight, setCanvasHeightValue, viewportSize.height]
  );

  // In zoom mode, floor at 2x viewport so there's room to draw
  const effectiveCanvasHeight = enableZoomPan
    ? Math.max(canvasHeight, viewportSize.height * 2)
    : canvasHeight;

  const zoomContentSizeStyle = useMemo(
    () => ({ width: viewportSize.width, height: effectiveCanvasHeight }),
    [viewportSize.width, effectiveCanvasHeight]
  );

  // --- Transform helpers ---

  const applyTransform = useCallback(
    (next: ViewTransform) => {
      const canvasW = viewportSize.width;
      const canvasH = enableZoomPan
        ? Math.max(
            effectiveCanvasHeight,
            maxYRef.current > 0 ? maxYRef.current + viewportSize.height : 0
          )
        : effectiveCanvasHeight;
      const clamped = clampTransform(
        next,
        canvasW,
        canvasH,
        viewportSize.width,
        viewportSize.height,
        maxZoomScale
      );
      viewTransformRef.current = clamped;
      setViewTransform(clamped);
      onTransformChangeRef.current?.(clamped);
    },
    [enableZoomPan, effectiveCanvasHeight, maxZoomScale, viewportSize, maxYRef]
  );

  // --- Layout & scroll handlers ---

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

  const handleZoomLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setViewportSize((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
      updateViewport({ scrollOffsetY: 0, viewportHeight: height });
      viewportRef.current = { scrollOffsetY: 0, viewportHeight: height };
    },
    [updateViewport]
  );

  return {
    // State
    viewTransform,
    viewTransformRef,
    viewportSize,
    canvasHeight,
    effectiveCanvasHeight,
    zoomContentSizeStyle,
    scrollViewRef,
    minimumCanvasHeightRef,
    onCanvasHeightChangeRef,
    // Actions
    setCanvasHeightValue,
    resetCanvasHeight,
    maybeGrowCanvasHeight,
    syncCanvasHeightFromMaxY,
    applyTransform,
    handleScroll,
    handleLayout,
    handleZoomLayout,
  };
}
