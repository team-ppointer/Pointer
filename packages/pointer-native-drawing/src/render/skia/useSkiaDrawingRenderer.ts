import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PixelRatio } from 'react-native';
import { CanvasRef, SkPath, Skia, useCanvasRef } from '@shopify/react-native-skia';
import type { RefObject } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

import type {
  ReadonlyStroke,
  ReadonlyStrokeBounds,
  ReadonlyStrokeSample,
  WritingFeelConfig,
} from '../../model/drawingTypes';
import type { RendererActions, RendererState, RendererViewport } from '../rendererTypes';
import { buildSmoothPath, buildCenterlinePath } from '../../smoothing';
import { DEFAULT_WRITING_FEEL_CONFIG } from '../../model/writingFeel';
import { getNativeLivePath, registerLivePathCallback, setNativeSessionConfig } from '../../nativePathBuilder';

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
  livePathSV: SharedValue<SkPath>;
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
  const [viewport, setViewport] = useState<RendererViewport>({
    scrollOffsetY: 0,
    viewportHeight: 0,
  });

  const resolvedConfig = writingFeelConfig ?? DEFAULT_WRITING_FEEL_CONFIG;

  // DPI-aware resample spacing: tighter on higher-density displays
  const targetSpacing = useMemo(() => 3.0 / PixelRatio.get(), []);

  const canvasRef = useCanvasRef();
  const committedPathsRef = useRef<SkPath[]>([]);
  const liveSamplesRef = useRef<ReadonlyArray<ReadonlyStrokeSample>>([]);
  const livePathSV = useSharedValue<SkPath>(EMPTY_PATH_SENTINEL);
  const prevLivePathRef = useRef<SkPath | null>(null);
  const livePathFrameRequest = useRef<number | null>(null);
  const renderGenRef = useRef(0);

  // Dispose previous live path safely. Called before assigning a new path
  // to the SharedValue. Uses microtask delay to let the Skia mapper finish
  // reading the old path on the UI thread.
  const updateLivePath = useCallback(
    (newPath: SkPath) => {
      const prev = prevLivePathRef.current;
      prevLivePathRef.current = newPath;
      livePathSV.value = newPath;
      if (prev && prev !== EMPTY_PATH_SENTINEL && prev !== newPath) {
        queueMicrotask(() => prev.dispose());
      }
    },
    [livePathSV]
  );

  // --- Phase 3: Sync config to native session ---
  useEffect(() => {
    setNativeSessionConfig(resolvedConfig, targetSpacing, 0.3, resolvedConfig.maxWidth);
  }, [resolvedConfig, targetSpacing]);

  // --- Phase 3D: Register native push callback (bypasses Fabric events) ---
  useEffect(() => {
    const registered = registerLivePathCallback((path: SkPath) => {
      updateLivePath(path);
    });
    if (__DEV__ && registered) {
      console.log('[PointerDrawing] Phase 3D: native live path push registered');
    }
  }, [updateLivePath]);

  // --- Native session tracking (Phase 3) ---
  const nativeSessionActiveRef = useRef(false);

  // --- Frozen prefix + live tail state ---
  const frozenPrefixPathRef = useRef<SkPath | null>(null);
  const freezeCursorRef = useRef(0);
  const frameCounterRef = useRef(0);

  const syncCommittedRenderingState = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
      nextPaths: SkPath[]
    ) => {
      const oldPaths = committedPathsRef.current;
      const retained = new Set(nextPaths);
      committedPathsRef.current = nextPaths;
      const toDispose = oldPaths.filter((p) => !retained.has(p));
      if (toDispose.length > 0) {
        queueMicrotask(() => toDispose.forEach((p) => p.dispose()));
      }
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
        return buildCenterlinePath(stroke.samples, resolvedConfig, targetSpacing);
      }),
    [resolvedConfig, targetSpacing]
  );

  const renderLivePathNow = useCallback(
    (samples: ReadonlyArray<ReadonlyStrokeSample>) => {
      if (samples.length <= 1) {
        return;
      }

      // Phase 3: Try native-built path first (built on UI thread, zero JS compute)
      const nativePath = getNativeLivePath();
      if (nativePath) {
        nativeSessionActiveRef.current = true;
        updateLivePath(nativePath);
        return;
      }

      // If native session was active but returned null (timing gap),
      // keep the previous path to avoid flicker between native/JS paths.
      if (nativeSessionActiveRef.current) {
        return;
      }

      // JS fallback: frozen prefix + tail (Android / non-native sessions)
      frameCounterRef.current++;

      const totalSamples = samples.length;
      const cursor = freezeCursorRef.current;

      const shouldFreeze =
        frameCounterRef.current % FREEZE_INTERVAL === 0 && totalSamples > TAIL_SIZE + TAIL_OVERLAP;

      if (shouldFreeze) {
        const newCursor = Math.max(cursor, totalSamples - TAIL_SIZE);
        if (newCursor > cursor) {
          if (frozenPrefixPathRef.current) {
            frozenPrefixPathRef.current.dispose();
          }
          frozenPrefixPathRef.current = buildCenterlinePath(
            samples.slice(0, newCursor),
            resolvedConfig,
            targetSpacing
          );
          freezeCursorRef.current = newCursor;
        }
      }

      const frozenPath = frozenPrefixPathRef.current;
      const activeCursor = freezeCursorRef.current;

      if (frozenPath && activeCursor > 0) {
        const tailStart = Math.max(0, activeCursor - TAIL_OVERLAP);
        const tailPath = buildCenterlinePath(
          samples.slice(tailStart),
          resolvedConfig,
          targetSpacing
        );
        const combined = Skia.Path.Make();
        combined.setIsVolatile(true);
        combined.addPath(frozenPath);
        combined.addPath(tailPath);
        tailPath.dispose();
        updateLivePath(combined);
      } else {
        updateLivePath(buildCenterlinePath(samples, resolvedConfig, targetSpacing));
      }
    },
    [resolvedConfig, targetSpacing]
  );

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
    [renderLivePathNow]
  );

  const resetLivePath = useCallback(() => {
    updateLivePath(EMPTY_PATH_SENTINEL);
    liveSamplesRef.current = [];
    nativeSessionActiveRef.current = false;
    // Reset frozen prefix state
    if (frozenPrefixPathRef.current) {
      frozenPrefixPathRef.current.dispose();
    }
    frozenPrefixPathRef.current = null;
    freezeCursorRef.current = 0;
    frameCounterRef.current = 0;
  }, [updateLivePath]);

  const startLivePath = useCallback(
    (x: number, y: number) => {
      const initial = Skia.Path.Make();
      initial.moveTo(x, y);
      updateLivePath(initial);
      liveSamplesRef.current = [];
      cancelScheduledLivePathRender();
      // Reset frozen prefix state for new stroke
      if (frozenPrefixPathRef.current) {
        frozenPrefixPathRef.current.dispose();
      }
      frozenPrefixPathRef.current = null;
      freezeCursorRef.current = 0;
      frameCounterRef.current = 0;
    },
    [cancelScheduledLivePathRender, updateLivePath]
  );

  const replaceCommittedStrokes = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>,
      prebuiltPaths?: readonly unknown[]
    ) => {
      const paths = (prebuiltPaths as SkPath[] | undefined) ?? buildPathsFromStrokes(nextStrokes);
      syncCommittedRenderingState(nextStrokes, nextBounds, paths);
    },
    [buildPathsFromStrokes, syncCommittedRenderingState]
  );

  const getCommittedPaths = useCallback(
    (): readonly unknown[] => [...committedPathsRef.current],
    []
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
        appendedPath = buildCenterlinePath(appendedStroke.samples, resolvedConfig, targetSpacing);
      }
      syncCommittedRenderingState(nextStrokes, nextBounds, [
        ...committedPathsRef.current,
        appendedPath,
      ]);
    },
    [syncCommittedRenderingState, resolvedConfig, targetSpacing]
  );

  const popCommittedStroke = useCallback(
    (
      nextStrokes: ReadonlyArray<ReadonlyStroke>,
      nextBounds: ReadonlyArray<ReadonlyStrokeBounds>
    ) => {
      const nextPaths = committedPathsRef.current.slice(0, -1);
      syncCommittedRenderingState(nextStrokes, nextBounds, nextPaths);
    },
    [syncCommittedRenderingState]
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
      const prev = prevLivePathRef.current;
      if (prev && prev !== EMPTY_PATH_SENTINEL) {
        prev.dispose();
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
    livePathSV,
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
      popCommittedStroke,
      getCommittedPaths,
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
      popCommittedStroke,
      getCommittedPaths,
      updateViewport,
    ]
  );

  return [state, actions];
}
