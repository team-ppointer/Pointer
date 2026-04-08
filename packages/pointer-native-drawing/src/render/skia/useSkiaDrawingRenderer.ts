import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CanvasRef, SkPath, Skia, useCanvasRef } from "@shopify/react-native-skia";
import type { ReadonlyStroke, ReadonlyStrokeBounds, ReadonlyStrokeSample, WritingFeelConfig } from "../../model/drawingTypes";
import type { RefObject } from "react";
import type { RendererActions, RendererState, RendererViewport } from "../rendererTypes";
import { buildSmoothPath, buildVariableWidthPath } from "../../smoothing";

type CommittedRenderingState = {
  paths: SkPath[];
  strokes: ReadonlyArray<ReadonlyStroke>;
  strokeBounds: ReadonlyArray<ReadonlyStrokeBounds>;
};

export type SkiaRendererState = RendererState & {
  paths: SkPath[];
  livePath: SkPath;
  isLivePathVariableWidth: boolean;
  canvasRef: RefObject<CanvasRef | null>;
};

export type SkiaRendererActions = RendererActions;

const EMPTY_COMMITTED_RENDERING_STATE: CommittedRenderingState = {
  paths: [],
  strokes: [],
  strokeBounds: [],
};

export function useSkiaDrawingRenderer(writingFeelConfig?: WritingFeelConfig): [SkiaRendererState, SkiaRendererActions] {
  const [committedState, setCommittedState] = useState<CommittedRenderingState>(
    EMPTY_COMMITTED_RENDERING_STATE,
  );
  const [isLiveStrokeActive, setIsLiveStrokeActive] = useState(false);
  const [isLivePathVariableWidth, setIsLivePathVariableWidth] = useState(false);
  const [viewport, setViewport] = useState<RendererViewport>({ scrollOffsetY: 0, viewportHeight: 0 });

  const canvasRef = useCanvasRef();
  const committedPathsRef = useRef<SkPath[]>([]);
  const liveSamplesRef = useRef<ReadonlyArray<ReadonlyStrokeSample>>([]);
  const livePath = useRef<SkPath>(Skia.Path.Make());
  const livePathFrameRequest = useRef<number | null>(null);

  const syncCommittedRenderingState = useCallback(
    (nextStrokes: ReadonlyArray<ReadonlyStroke>, nextBounds: ReadonlyArray<ReadonlyStrokeBounds>, nextPaths: SkPath[]) => {
      committedPathsRef.current = nextPaths;
      setCommittedState({
        paths: nextPaths,
        strokes: nextStrokes,
        strokeBounds: nextBounds,
      });
    },
    [],
  );

  const buildPathsFromStrokes = useCallback(
    (nextStrokes: ReadonlyArray<ReadonlyStroke>) =>
      nextStrokes.map((stroke) =>
        stroke.samples && stroke.samples.length > 0
          ? buildVariableWidthPath(stroke.samples, writingFeelConfig)
          : buildSmoothPath(stroke.points),
      ),
    [writingFeelConfig],
  );

  const renderLivePathNow = useCallback((samples: ReadonlyArray<ReadonlyStrokeSample>) => {
    if (samples.length <= 1) {
      canvasRef.current?.redraw();
      return;
    }

    const hasVariableWidth = samples.some((s) => s.pressure !== undefined);
    if (hasVariableWidth) {
      const rebuilt = buildVariableWidthPath(samples, writingFeelConfig);
      livePath.current.reset();
      livePath.current.addPath(rebuilt);
      setIsLivePathVariableWidth(true);
    } else {
      const rebuilt = buildSmoothPath(samples);
      livePath.current.reset();
      livePath.current.addPath(rebuilt);
      setIsLivePathVariableWidth(false);
    }

    canvasRef.current?.redraw();
  }, [canvasRef, writingFeelConfig]);

  const cancelScheduledLivePathRender = useCallback(() => {
    if (livePathFrameRequest.current === null) {
      return;
    }
    cancelAnimationFrame(livePathFrameRequest.current);
    livePathFrameRequest.current = null;
  }, []);

  const scheduleLivePathRender = useCallback(
    (samples: ReadonlyArray<ReadonlyStrokeSample>) => {
      liveSamplesRef.current = samples;

      if (livePathFrameRequest.current !== null) {
        return;
      }

      livePathFrameRequest.current = requestAnimationFrame(() => {
        livePathFrameRequest.current = null;
        renderLivePathNow(liveSamplesRef.current);
      });
    },
    [renderLivePathNow],
  );

  const resetLivePath = useCallback(() => {
    livePath.current.reset();
    liveSamplesRef.current = [];
    setIsLiveStrokeActive(false);
    setIsLivePathVariableWidth(false);
  }, []);

  const startLivePath = useCallback(
    (x: number, y: number) => {
      livePath.current.reset();
      livePath.current.moveTo(x, y);
      liveSamplesRef.current = [];
      cancelScheduledLivePathRender();
      setIsLiveStrokeActive(true);
    },
    [cancelScheduledLivePathRender],
  );

  const replaceCommittedStrokes = useCallback(
    (nextStrokes: ReadonlyArray<ReadonlyStroke>, nextBounds: ReadonlyArray<ReadonlyStrokeBounds>) => {
      syncCommittedRenderingState(
        nextStrokes,
        nextBounds,
        buildPathsFromStrokes(nextStrokes),
      );
    },
    [buildPathsFromStrokes, syncCommittedRenderingState],
  );

  const appendCommittedStroke = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
      appendedStroke: ReadonlyStroke,
    ) => {
      const appendedPath = appendedStroke.samples && appendedStroke.samples.length > 0
        ? buildVariableWidthPath(appendedStroke.samples, writingFeelConfig)
        : buildSmoothPath(appendedStroke.points);
      syncCommittedRenderingState(nextStrokes, nextBounds, [
        ...committedPathsRef.current,
        appendedPath,
      ]);
    },
    [syncCommittedRenderingState, writingFeelConfig],
  );

  const retainOrRebuildCommittedStrokes = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
      retainedStrokeIndices?: ReadonlyArray<number>,
    ) => {
      const nextPaths = retainedStrokeIndices
        ? retainedStrokeIndices
            .map((index) => committedPathsRef.current[index])
            .filter((path): path is SkPath => Boolean(path))
        : buildPathsFromStrokes(nextStrokes);

      syncCommittedRenderingState(nextStrokes, nextBounds, nextPaths);
    },
    [buildPathsFromStrokes, syncCommittedRenderingState],
  );

  // Viewport updates trigger a React re-render via useState to recalculate
  // visible stroke culling. A ref-based approach would skip the render cycle
  // needed for useMemo culling in SkiaDrawingCanvasSurface.
  const updateViewport = useCallback((next: RendererViewport) => {
    setViewport((prev) => {
      if (prev.scrollOffsetY === next.scrollOffsetY && prev.viewportHeight === next.viewportHeight) {
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      cancelScheduledLivePathRender();
    };
  }, [cancelScheduledLivePathRender]);

  const state: SkiaRendererState = {
    paths: committedState.paths,
    strokes: committedState.strokes,
    strokeBounds: committedState.strokeBounds,
    livePath: livePath.current,
    isLiveStrokeActive,
    isLivePathVariableWidth,
    viewport,
    canvasRef,
  };

  const actions: SkiaRendererActions = useMemo(
    () => ({
      startLivePath,
      scheduleLivePathRender,
      cancelScheduledLivePathRender,
      resetLivePath,
      replaceCommittedStrokes,
      appendCommittedStroke,
      retainOrRebuildCommittedStrokes,
      updateViewport,
    }),
    [
      startLivePath,
      scheduleLivePathRender,
      cancelScheduledLivePathRender,
      resetLivePath,
      replaceCommittedStrokes,
      appendCommittedStroke,
      retainOrRebuildCommittedStrokes,
      updateViewport,
    ],
  );

  return [state, actions];
}
