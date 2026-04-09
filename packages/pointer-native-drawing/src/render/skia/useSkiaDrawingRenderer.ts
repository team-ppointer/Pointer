import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { CanvasRef, SkPath, Skia, useCanvasRef } from '@shopify/react-native-skia';
import type {
  ReadonlyStroke,
  ReadonlyStrokeBounds,
  ReadonlyStrokeSample,
  WritingFeelConfig,
} from '../../model/drawingTypes';
import { isFixedWidthConfig, DEFAULT_WRITING_FEEL_CONFIG } from '../../model/writingFeel';
import type { RendererActions, RendererState, RendererViewport } from '../rendererTypes';
import { buildCenterlinePath, buildSmoothPath, buildVariableWidthPath } from '../../smoothing';
import type { PathBuildState } from '../../smoothing';

const EMPTY_PATH_SENTINEL = Skia.Path.Make();

/** How often (in frames) to freeze the prefix */
const FREEZE_INTERVAL = 10;
/** Max samples in the live tail (including overlap) */
const TAIL_SIZE = 30;
/** Overlap samples between frozen prefix and live tail for visual continuity */
const TAIL_OVERLAP = 3;

type CommittedRenderingState = {
  paths: SkPath[];
  strokes: ReadonlyArray<ReadonlyStroke>;
  strokeBounds: ReadonlyArray<ReadonlyStrokeBounds>;
};

export type SkiaRendererState = RendererState & {
  paths: SkPath[];
  livePath: SkPath;
  isLivePathVariableWidth: boolean;
  fixedWidthMode: boolean;
  canvasRef: RefObject<CanvasRef | null>;
};

export type SkiaRendererActions = RendererActions;

const EMPTY_COMMITTED_RENDERING_STATE: CommittedRenderingState = {
  paths: [],
  strokes: [],
  strokeBounds: [],
};

export function useSkiaDrawingRenderer(
  writingFeelConfig?: WritingFeelConfig
): [SkiaRendererState, SkiaRendererActions] {
  const [committedState, setCommittedState] = useState<CommittedRenderingState>(
    EMPTY_COMMITTED_RENDERING_STATE
  );
  const [isLiveStrokeActive, setIsLiveStrokeActive] = useState(false);
  const [isLivePathVariableWidth, setIsLivePathVariableWidth] = useState(false);
  const [viewport, setViewport] = useState<RendererViewport>({
    scrollOffsetY: 0,
    viewportHeight: 0,
  });

  const resolvedConfig = writingFeelConfig ?? DEFAULT_WRITING_FEEL_CONFIG;
  const fixedWidth = useMemo(() => isFixedWidthConfig(resolvedConfig), [resolvedConfig]);

  const canvasRef = useCanvasRef();
  const committedPathsRef = useRef<SkPath[]>([]);
  const liveSamplesRef = useRef<ReadonlyArray<ReadonlyStrokeSample>>([]);

  // --- ref-based live path (skia v2 declarative API에서 redraw()가 scene graph를 다시
  //     방문하지만 React reconciliation을 거치지 않아 <Path> mount 전 redraw 시
  //     라이브 패스가 안 보이는 문제 있음. state 기반 유지.) ---
  // const livePathRef = useRef<SkPath>(Skia.Path.Make());
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
  const frozenPrefixWidthStateRef = useRef<PathBuildState | null>(null);

  const syncCommittedRenderingState = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
      nextPaths: SkPath[]
    ) => {
      committedPathsRef.current = nextPaths;
      setCommittedState({
        paths: nextPaths,
        strokes: nextStrokes,
        strokeBounds: nextBounds,
      });
    },
    []
  );

  const buildPathsFromStrokes = useCallback(
    (nextStrokes: ReadonlyArray<ReadonlyStroke>) =>
      nextStrokes.map((stroke) => {
        if (!stroke.samples || stroke.samples.length === 0) {
          return buildSmoothPath(stroke.points);
        }
        // A: fixed-width → raw Catmull-Rom (same as live, no visual snap on commit)
        // B: fixed-width → buildCenterlinePath (resample+smooth, higher quality)
        return fixedWidth
          ? buildSmoothPath(stroke.samples)
          : buildVariableWidthPath(stroke.samples, resolvedConfig);
      }),
    [resolvedConfig, fixedWidth]
  );

  const renderLivePathNow = useCallback(
    (samples: ReadonlyArray<ReadonlyStrokeSample>) => {
      if (samples.length <= 1) {
        return;
      }

      const hasPressure = samples.length > 0 && samples[0].pressure !== undefined;

      // Centerline mode: no pressure data OR fixed-width config
      // Live path: skip resample/smooth, use raw Catmull-Rom for lowest
      // latency. Full pipeline (resample + smooth) runs on commit only.
      if (!hasPressure || fixedWidth) {
        setIsLivePathVariableWidth(false);
        frameCounterRef.current++;

        const totalSamples = samples.length;
        const cursor = freezeCursorRef.current;

        // Frozen prefix: same pattern as variable-width, but with buildSmoothPath
        const shouldFreeze =
          frameCounterRef.current % FREEZE_INTERVAL === 0 &&
          totalSamples > TAIL_SIZE + TAIL_OVERLAP;

        if (shouldFreeze) {
          const newCursor = Math.max(cursor, totalSamples - TAIL_SIZE);
          if (newCursor > cursor) {
            if (frozenPrefixPathRef.current) {
              frozenPrefixPathRef.current.dispose();
            }
            frozenPrefixPathRef.current = buildSmoothPath(samples.slice(0, newCursor));
            freezeCursorRef.current = newCursor;
          }
        }

        const frozenPath = frozenPrefixPathRef.current;
        const activeCursor = freezeCursorRef.current;

        if (frozenPath && activeCursor > 0) {
          // Rebuild only the tail — Catmull-Rom overlap ensures visual continuity
          const tailStart = Math.max(0, activeCursor - TAIL_OVERLAP);
          const tailPath = buildSmoothPath(samples.slice(tailStart));
          const combined = Skia.Path.Make();
          combined.setIsVolatile(true);
          combined.addPath(frozenPath);
          combined.addPath(tailPath);
          tailPath.dispose();
          setLivePath(combined);
          // ref-based: livePathRef.current.reset(); livePathRef.current.addPath(frozenPath); livePathRef.current.addPath(tailPath); tailPath.dispose(); canvasRef.current?.redraw();
        } else {
          setLivePath(buildSmoothPath(samples));
          // ref-based: const p = buildSmoothPath(samples); livePathRef.current.reset(); livePathRef.current.addPath(p); p.dispose(); canvasRef.current?.redraw();
        }
        return;
      }

      // --- Variable-width: polygon envelope with frozen prefix optimization ---
      setIsLivePathVariableWidth(true);
      frameCounterRef.current++;

      const totalSamples = samples.length;
      const cursor = freezeCursorRef.current;

      // Determine if we should advance the frozen prefix
      const shouldFreeze =
        frameCounterRef.current % FREEZE_INTERVAL === 0 && totalSamples > TAIL_SIZE + TAIL_OVERLAP;

      if (shouldFreeze) {
        // Advance cursor: freeze everything except the tail
        const newCursor = Math.max(cursor, totalSamples - TAIL_SIZE);
        if (newCursor > cursor) {
          // Build frozen prefix path from samples[0..newCursor]
          if (frozenPrefixPathRef.current) {
            frozenPrefixPathRef.current.dispose();
          }
          const prefixSamples = samples.slice(0, newCursor);
          const prefixState: PathBuildState = {};
          frozenPrefixPathRef.current = buildVariableWidthPath(
            prefixSamples,
            resolvedConfig,
            undefined,
            prefixState,
            { end: false }
          );
          frozenPrefixWidthStateRef.current = prefixState;
          freezeCursorRef.current = newCursor;
        }
      }

      const frozenPath = frozenPrefixPathRef.current;
      const activeCursor = freezeCursorRef.current;

      if (frozenPath && activeCursor > 0) {
        // Build only the tail (with overlap for continuity)
        const tailStart = Math.max(0, activeCursor - TAIL_OVERLAP);
        const tailSamples = samples.slice(tailStart);
        // Seed tail EMA from frozen prefix state for width continuity
        const tailState: PathBuildState = frozenPrefixWidthStateRef.current
          ? { lastSmoothedWidth: frozenPrefixWidthStateRef.current.lastSmoothedWidth }
          : {};
        const tailPath = buildVariableWidthPath(
          tailSamples,
          resolvedConfig,
          undefined,
          tailState,
          { start: false, end: true }
        );

        // Combine frozen prefix + live tail
        const combined = Skia.Path.Make();
        combined.setIsVolatile(true);
        combined.addPath(frozenPath);
        combined.addPath(tailPath);
        tailPath.dispose();
        setLivePath(combined);
        // ref-based: livePathRef.current.reset(); livePathRef.current.addPath(frozenPath); livePathRef.current.addPath(tailPath); tailPath.dispose(); canvasRef.current?.redraw();
      } else {
        // Not enough samples to freeze — full rebuild
        setLivePath(buildVariableWidthPath(samples, resolvedConfig));
        // ref-based: const p = buildVariableWidthPath(samples, resolvedConfig); livePathRef.current.reset(); livePathRef.current.addPath(p); p.dispose(); canvasRef.current?.redraw();
      }
    },
    [resolvedConfig, fixedWidth]
  );

  const cancelScheduledLivePathRender = useCallback(() => {
    // Invalidate any pending microtask by bumping generation
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
      // Microtask runs immediately after the current JS task (touch callback),
      // allowing the path to be built and setState called in the same frame.
      const gen = ++renderGenRef.current;
      livePathFrameRequest.current = gen;
      queueMicrotask(() => {
        if (renderGenRef.current !== gen) return;
        livePathFrameRequest.current = null;
        renderLivePathNow(liveSamplesRef.current);
      });
    },
    [renderLivePathNow]
  );

  const resetLivePath = useCallback(() => {
    setLivePath(EMPTY_PATH_SENTINEL);
    // ref-based: livePathRef.current.reset(); canvasRef.current?.redraw();
    liveSamplesRef.current = [];
    setIsLiveStrokeActive(false);
    setIsLivePathVariableWidth(false);
    // Reset frozen prefix state
    if (frozenPrefixPathRef.current) {
      frozenPrefixPathRef.current.dispose();
    }
    frozenPrefixPathRef.current = null;
    frozenPrefixWidthStateRef.current = null;
    freezeCursorRef.current = 0;
    frameCounterRef.current = 0;
  }, []);

  const startLivePath = useCallback(
    (x: number, y: number) => {
      const initial = Skia.Path.Make();
      initial.moveTo(x, y);
      setLivePath(initial);
      // ref-based: livePathRef.current.reset(); livePathRef.current.moveTo(x, y); canvasRef.current?.redraw();
      liveSamplesRef.current = [];
      cancelScheduledLivePathRender();
      setIsLiveStrokeActive(true);
      // Reset frozen prefix state for new stroke
      if (frozenPrefixPathRef.current) {
        frozenPrefixPathRef.current.dispose();
      }
      frozenPrefixPathRef.current = null;
      frozenPrefixWidthStateRef.current = null;
      freezeCursorRef.current = 0;
      frameCounterRef.current = 0;
    },
    [cancelScheduledLivePathRender]
  );

  const replaceCommittedStrokes = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>
    ) => {
      syncCommittedRenderingState(nextStrokes, nextBounds, buildPathsFromStrokes(nextStrokes));
    },
    [buildPathsFromStrokes, syncCommittedRenderingState]
  );

  const appendCommittedStroke = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
      appendedStroke: ReadonlyStroke
    ) => {
      let appendedPath: SkPath;
      if (!appendedStroke.samples || appendedStroke.samples.length === 0) {
        appendedPath = buildSmoothPath(appendedStroke.points);
      } else {
        // A: fixed-width → raw Catmull-Rom (matches live path exactly)
        // B: fixed-width → buildCenterlinePath (resample+smooth)
        appendedPath = fixedWidth
          ? buildSmoothPath(appendedStroke.samples)
          : buildVariableWidthPath(appendedStroke.samples, resolvedConfig);
      }
      syncCommittedRenderingState(nextStrokes, nextBounds, [
        ...committedPathsRef.current,
        appendedPath,
      ]);
    },
    [syncCommittedRenderingState, resolvedConfig, fixedWidth]
  );

  const retainOrRebuildCommittedStrokes = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
      retainedStrokeIndices?: ReadonlyArray<number>
    ) => {
      const nextPaths = retainedStrokeIndices
        ? retainedStrokeIndices
            .map((index) => committedPathsRef.current[index])
            .filter((path): path is SkPath => Boolean(path))
        : buildPathsFromStrokes(nextStrokes);

      syncCommittedRenderingState(nextStrokes, nextBounds, nextPaths);
    },
    [buildPathsFromStrokes, syncCommittedRenderingState]
  );

  const updateViewport = useCallback((next: RendererViewport) => {
    setViewport((prev) => {
      if (
        prev.scrollOffsetY === next.scrollOffsetY &&
        prev.viewportHeight === next.viewportHeight
      ) {
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
      // ref-based: livePathRef.current.dispose();
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
    isLivePathVariableWidth,
    fixedWidthMode: fixedWidth,
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
    ]
  );

  return [state, actions];
}
