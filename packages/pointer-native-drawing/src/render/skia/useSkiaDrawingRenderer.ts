import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CanvasRef, SkPath, Skia, useCanvasRef } from "@shopify/react-native-skia";
import type { ReadonlyStroke, ReadonlyStrokeBounds, ReadonlyStrokeSample, WritingFeelConfig } from "../../model/drawingTypes";
import type { RefObject } from "react";
import type { RendererActions, RendererState, RendererViewport } from "../rendererTypes";
import { buildSmoothPath, buildCenterlinePath } from "../../smoothing";
import { DEFAULT_WRITING_FEEL_CONFIG } from "../../model/writingFeel";
import { PixelRatio } from "react-native";

const EMPTY_PATH_SENTINEL = Skia.Path.Make();

/** How often (in frames) to freeze the prefix */
const FREEZE_INTERVAL = 10;
/** Max samples in the live tail (including overlap) */
const TAIL_SIZE = 30;
/** Overlap samples between frozen prefix and live tail for Catmull-Rom ghost points.
 *  Fixed-width rendering uses stroke style, so minimal overlap (1 sample) is
 *  sufficient for spline continuity without causing AA fringe doubling. */
const TAIL_OVERLAP = 1;

type CommittedRenderingState = {
  paths: SkPath[];
  strokes: ReadonlyArray<ReadonlyStroke>;
  strokeBounds: ReadonlyArray<ReadonlyStrokeBounds>;
};

export type SkiaRendererState = RendererState & {
  paths: SkPath[];
  livePath: SkPath;
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
  const [viewport, setViewport] = useState<RendererViewport>({ scrollOffsetY: 0, viewportHeight: 0 });

  const resolvedConfig = writingFeelConfig ?? DEFAULT_WRITING_FEEL_CONFIG;

  // DPI-aware resample spacing: tighter on higher-density displays
  const targetSpacing = useMemo(() => 3.0 / PixelRatio.get(), []);

  const canvasRef = useCanvasRef();
  const committedPathsRef = useRef<SkPath[]>([]);
  const liveSamplesRef = useRef<ReadonlyArray<ReadonlyStrokeSample>>([]);
  const [livePath, setLivePath] = useState<SkPath>(EMPTY_PATH_SENTINEL);
  const prevLivePathRef = useRef<SkPath | null>(null);
  const livePathFrameRequest = useRef<number | null>(null);
  const renderGenRef = useRef(0);

  // Deferred dispose: wait until React has rendered the new path before
  // disposing the old one, preventing use-after-dispose in the Skia Canvas.
  useEffect(() => {
    const prev = prevLivePathRef.current;
    prevLivePathRef.current = livePath;
    if (prev && prev !== EMPTY_PATH_SENTINEL && prev !== livePath) {
      prev.dispose();
    }
  }, [livePath]);

  // --- Frozen prefix + live tail state ---
  const frozenPrefixPathRef = useRef<SkPath | null>(null);
  const freezeCursorRef = useRef(0);
  const frameCounterRef = useRef(0);

  const syncCommittedRenderingState = useCallback(
    (nextStrokes: ReadonlyArray<ReadonlyStroke>, nextBounds: ReadonlyArray<ReadonlyStrokeBounds>, nextPaths: SkPath[]) => {
      const oldPaths = committedPathsRef.current;
      const retained = new Set(nextPaths);
      for (const p of oldPaths) {
        if (!retained.has(p)) p.dispose();
      }
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
      nextStrokes.map((stroke) => {
        if (!stroke.samples || stroke.samples.length === 0) {
          return buildSmoothPath(stroke.points);
        }
        return buildCenterlinePath(stroke.samples, resolvedConfig, targetSpacing);
      }),
    [resolvedConfig, targetSpacing],
  );

  const renderLivePathNow = useCallback((samples: ReadonlyArray<ReadonlyStrokeSample>) => {
    if (samples.length <= 1) {
      return;
    }

    frameCounterRef.current++;

    const totalSamples = samples.length;
    const cursor = freezeCursorRef.current;

    const shouldFreeze =
      frameCounterRef.current % FREEZE_INTERVAL === 0 &&
      totalSamples > TAIL_SIZE + TAIL_OVERLAP;

    if (shouldFreeze) {
      const newCursor = Math.max(cursor, totalSamples - TAIL_SIZE);
      if (newCursor > cursor) {
        if (frozenPrefixPathRef.current) {
          frozenPrefixPathRef.current.dispose();
        }
        frozenPrefixPathRef.current = buildCenterlinePath(samples.slice(0, newCursor), resolvedConfig, targetSpacing);
        freezeCursorRef.current = newCursor;
      }
    }

    const frozenPath = frozenPrefixPathRef.current;
    const activeCursor = freezeCursorRef.current;

    if (frozenPath && activeCursor > 0) {
      const tailStart = Math.max(0, activeCursor - TAIL_OVERLAP);
      const tailPath = buildCenterlinePath(samples.slice(tailStart), resolvedConfig, targetSpacing);
      const combined = Skia.Path.Make();
      combined.setIsVolatile(true);
      combined.addPath(frozenPath);
      combined.addPath(tailPath);
      tailPath.dispose();
      setLivePath(combined);
    } else {
      setLivePath(buildCenterlinePath(samples, resolvedConfig, targetSpacing));
    }
  }, [resolvedConfig, targetSpacing]);

  const cancelScheduledLivePathRender = useCallback(() => {
    renderGenRef.current++;
    livePathFrameRequest.current = null;
  }, []);

  const scheduleLivePathRender = useCallback(
    (samples: ReadonlyArray<ReadonlyStrokeSample>) => {
      liveSamplesRef.current = samples;

      if (livePathFrameRequest.current !== null) {
        return;
      }

      // Use microtask instead of rAF: Apple Pencil coalesced touches already
      // arrive once per vsync, so rAF throttling only adds 1 frame of latency.
      const gen = ++renderGenRef.current;
      livePathFrameRequest.current = gen;
      queueMicrotask(() => {
        if (renderGenRef.current !== gen) return;
        livePathFrameRequest.current = null;
        renderLivePathNow(liveSamplesRef.current);
      });
    },
    [renderLivePathNow],
  );

  const resetLivePath = useCallback(() => {
    setLivePath(EMPTY_PATH_SENTINEL);
    liveSamplesRef.current = [];
    setIsLiveStrokeActive(false);
    // Reset frozen prefix state
    if (frozenPrefixPathRef.current) {
      frozenPrefixPathRef.current.dispose();
    }
    frozenPrefixPathRef.current = null;
    freezeCursorRef.current = 0;
    frameCounterRef.current = 0;
  }, []);

  const startLivePath = useCallback(
    (x: number, y: number) => {
      const initial = Skia.Path.Make();
      initial.moveTo(x, y);
      setLivePath(initial);
      liveSamplesRef.current = [];
      cancelScheduledLivePathRender();
      setIsLiveStrokeActive(true);
      // Reset frozen prefix state for new stroke
      if (frozenPrefixPathRef.current) {
        frozenPrefixPathRef.current.dispose();
      }
      frozenPrefixPathRef.current = null;
      freezeCursorRef.current = 0;
      frameCounterRef.current = 0;
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
      let appendedPath: SkPath;
      if (!appendedStroke.samples || appendedStroke.samples.length === 0) {
        appendedPath = buildSmoothPath(appendedStroke.points);
      } else {
        appendedPath = buildCenterlinePath(appendedStroke.samples, resolvedConfig, targetSpacing);
      }
      syncCommittedRenderingState(nextStrokes, nextBounds, [
        ...committedPathsRef.current,
        appendedPath,
      ]);
    },
    [syncCommittedRenderingState, resolvedConfig, targetSpacing],
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
      if (prevLivePathRef.current && prevLivePathRef.current !== EMPTY_PATH_SENTINEL) {
        prevLivePathRef.current.dispose();
      }
      if (frozenPrefixPathRef.current) {
        frozenPrefixPathRef.current.dispose();
      }
    };
  }, [cancelScheduledLivePathRender]);

  const state: SkiaRendererState = {
    paths: committedState.paths,
    strokes: committedState.strokes,
    strokeBounds: committedState.strokeBounds,
    livePath,
    isLiveStrokeActive,
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
