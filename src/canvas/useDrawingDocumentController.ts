import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { InputEvent, Stroke } from "../model/drawingTypes";
import { normalizeStrokeWidth } from "../model/strokeUtils";
import { DrawingEngine } from "../engine/DrawingEngine";
import { HistoryManager } from "../engine/HistoryManager";
import type { DocumentSnapshot, HistoryEntry } from "../engine/HistoryManager";
import type { RendererActions } from "../render/rendererTypes";
import type { CancelReason } from "../input/inputTypes";

/**
 * Minimal textbox actions interface consumed by the document controller.
 * The full textbox manager is created separately; this ref is wired after.
 */
export type DocumentTextBoxActions = {
  endSession: () => void;
  clearTextBoxes: () => void;
  applyHistoryEntry: (entry: HistoryEntry, direction: "undo" | "redo") => void;
};

export type UseDrawingDocumentControllerArgs = {
  strokeWidth: number;
  strokeColor: string;
  eraserSize: number;
  onChange?: (strokes: Stroke[]) => void;
  onUndoStateChange?: (state: { canUndo: boolean; canRedo: boolean }) => void;
  rendererActions: RendererActions;
  textBoxActionsRef: RefObject<DocumentTextBoxActions | null>;
  maxYRef: RefObject<number>;
  maybeGrowCanvasHeight: (nextMaxY: number) => void;
  syncCanvasHeightFromMaxY: (nextMaxY: number) => void;
};

export function useDrawingDocumentController({
  strokeWidth,
  strokeColor,
  eraserSize,
  onChange,
  onUndoStateChange,
  rendererActions,
  textBoxActionsRef,
  maxYRef,
  maybeGrowCanvasHeight,
  syncCanvasHeightFromMaxY,
}: UseDrawingDocumentControllerArgs) {
  const engineRef = useRef<DrawingEngine>(new DrawingEngine());
  const historyRef = useRef<HistoryManager>(new HistoryManager());

  const [eraserCursor, setEraserCursor] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const normalizedPenStrokeWidth = useMemo(
    () => normalizeStrokeWidth(strokeWidth),
    [strokeWidth],
  );

  // Stable refs for props used in callbacks
  const onChangeRef = useRef(onChange);
  const onUndoStateChangeRef = useRef(onUndoStateChange);
  const strokeColorRef = useRef(strokeColor);
  const eraserSizeRef = useRef(eraserSize);
  onChangeRef.current = onChange;
  onUndoStateChangeRef.current = onUndoStateChange;
  strokeColorRef.current = strokeColor;
  eraserSizeRef.current = eraserSize;

  // Wire history state listener
  useEffect(() => {
    historyRef.current.setListener((state) => {
      onUndoStateChangeRef.current?.(state);
    });
    return () => historyRef.current.setListener(null);
  }, []);

  const {
    startLivePath,
    scheduleLivePathRender,
    cancelScheduledLivePathRender,
    resetLivePath,
    replaceCommittedStrokes,
    appendCommittedStroke,
    retainOrRebuildCommittedStrokes,
  } = rendererActions;

  // --- Document operations ---

  const notifyChange = useCallback(() => {
    onChangeRef.current?.(engineRef.current.getStrokes());
  }, []);

  const captureSnapshot = useCallback((): DocumentSnapshot => {
    const doc = engineRef.current.getDocument();
    const bounds = engineRef.current.getStrokeBounds();
    return {
      strokes: [...doc.strokes] as Stroke[],
      bounds: [...bounds],
    };
  }, []);

  const startStroke = useCallback(
    (input: InputEvent) => {
      const result = engineRef.current.startStroke(input);
      startLivePath(input.x, input.y);
      maybeGrowCanvasHeight(result.maxY);
    },
    [startLivePath, maybeGrowCanvasHeight],
  );

  const addPoint = useCallback(
    (input: InputEvent) => {
      const result = engineRef.current.addPoint(input, {
        strokeWidth: normalizedPenStrokeWidth,
        fixedWidth: true,
      });
      scheduleLivePathRender(engineRef.current.getSessionSamples());
      maybeGrowCanvasHeight(result.maxY);
    },
    [normalizedPenStrokeWidth, scheduleLivePathRender, maybeGrowCanvasHeight],
  );

  const handlePredictedSamples = useCallback(
    (inputs: InputEvent[]) => {
      const sessionSamples = engineRef.current.getSessionSamples();
      const predicted = inputs.map((e) => ({
        x: e.x,
        y: e.y,
        pressure: e.pressure,
        tiltX: e.tiltX,
        tiltY: e.tiltY,
        timestamp: e.timestamp,
      }));
      scheduleLivePathRender([...sessionSamples, ...predicted]);
    },
    [scheduleLivePathRender],
  );

  const finalizeStroke = useCallback(() => {
    cancelScheduledLivePathRender();

    if (engineRef.current.getSessionPoints().length === 0) {
      resetLivePath();
      return;
    }

    const snapshotBefore = captureSnapshot();

    const result = engineRef.current.finalizeStroke({
      strokeColor: strokeColorRef.current,
      strokeWidth: normalizedPenStrokeWidth,
    });
    if (!result.changed || !result.appendedStroke) {
      resetLivePath();
      return;
    }

    historyRef.current.push({
      type: "append-stroke",
      stroke: result.appendedStroke as Stroke,
      bounds: result.appendedStrokeBounds!,
      snapshotBefore,
    });

    appendCommittedStroke(
      result.document.strokes,
      result.strokeBounds,
      result.appendedStroke,
    );
    notifyChange();
    syncCanvasHeightFromMaxY(result.maxY);

    resetLivePath();
  }, [
    appendCommittedStroke,
    cancelScheduledLivePathRender,
    captureSnapshot,
    normalizedPenStrokeWidth,
    notifyChange,
    resetLivePath,
    syncCanvasHeightFromMaxY,
  ]);

  const eraseAtPoint = useCallback(
    (input: InputEvent) => {
      setEraserCursor({ x: input.x, y: input.y });
      const result = engineRef.current.eraseAtPoint(input, {
        eraserSize: eraserSizeRef.current,
      });
      if (!result.changed) return;

      retainOrRebuildCommittedStrokes(
        result.document.strokes,
        result.strokeBounds,
        result.retainedStrokeIndices,
      );
      syncCanvasHeightFromMaxY(result.maxY);
      notifyChange();
    },
    [notifyChange, retainOrRebuildCommittedStrokes, syncCanvasHeightFromMaxY],
  );

  const forceCommitActiveSession = useCallback(() => {
    if (!engineRef.current.hasActiveSession()) return;

    cancelScheduledLivePathRender();
    resetLivePath();

    const snapshotBefore = captureSnapshot();

    const result = engineRef.current.finalizeStroke({
      strokeColor: strokeColorRef.current,
      strokeWidth: normalizedPenStrokeWidth,
    });
    if (result.changed && result.appendedStroke) {
      historyRef.current.push({
        type: "append-stroke",
        stroke: result.appendedStroke as Stroke,
        bounds: result.appendedStrokeBounds!,
        snapshotBefore,
      });
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
    captureSnapshot,
    normalizedPenStrokeWidth,
    resetLivePath,
    syncCanvasHeightFromMaxY,
  ]);

  const cancelDraw = useCallback((reason?: CancelReason) => {
    if (reason === "interrupted") {
      // 2nd finger (zoom/pan intent) — always discard partial stroke
      cancelScheduledLivePathRender();
      resetLivePath();
      engineRef.current.discardSession();
      return;
    }

    // RNGH gesture_failed — commit partial stroke if meaningful
    const sessionPoints = engineRef.current.getSessionPoints();
    if (sessionPoints.length <= 1) {
      cancelScheduledLivePathRender();
      resetLivePath();
      engineRef.current.discardSession();
      return;
    }

    forceCommitActiveSession();
    notifyChange();
  }, [
    cancelScheduledLivePathRender,
    forceCommitActiveSession,
    notifyChange,
    resetLivePath,
  ]);

  const setStrokesFromOutside = useCallback(
    (nextStrokes: Stroke[]) => {
      forceCommitActiveSession();
      textBoxActionsRef.current?.endSession();

      const result = engineRef.current.applyStrokes(nextStrokes);
      // External sync — not a user action, clear history
      historyRef.current.clear();
      replaceCommittedStrokes(result.document.strokes, result.strokeBounds);
      syncCanvasHeightFromMaxY(result.maxY);
      notifyChange();
    },
    [
      forceCommitActiveSession,
      notifyChange,
      replaceCommittedStrokes,
      syncCanvasHeightFromMaxY,
      textBoxActionsRef,
    ],
  );

  const clear = useCallback(() => {
    cancelScheduledLivePathRender();
    resetLivePath();

    textBoxActionsRef.current?.endSession();
    textBoxActionsRef.current?.clearTextBoxes();

    if (engineRef.current.hasActiveSession()) {
      engineRef.current.finalizeStroke({
        strokeColor: strokeColorRef.current,
        strokeWidth: normalizedPenStrokeWidth,
      });
    }

    const snapshotBefore = captureSnapshot();

    const result = engineRef.current.clear();

    historyRef.current.push({
      type: "replace-document",
      snapshotBefore,
      snapshotAfter: { strokes: [], bounds: [] },
    });

    replaceCommittedStrokes(result.document.strokes, result.strokeBounds);
    syncCanvasHeightFromMaxY(result.maxY);
    notifyChange();
  }, [
    cancelScheduledLivePathRender,
    captureSnapshot,
    normalizedPenStrokeWidth,
    notifyChange,
    replaceCommittedStrokes,
    resetLivePath,
    syncCanvasHeightFromMaxY,
    textBoxActionsRef,
  ]);

  const getStrokes = useCallback(() => {
    return engineRef.current.getStrokes();
  }, []);

  const applyHistoryState = useCallback(
    (entry: HistoryEntry, direction: "undo" | "redo") => {
      let result;
      switch (entry.type) {
        case "append-stroke": {
          if (direction === "undo") {
            result = engineRef.current.applyStrokes(
              entry.snapshotBefore.strokes as Stroke[],
            );
          } else {
            result = engineRef.current.applyStrokes(
              [...entry.snapshotBefore.strokes, entry.stroke] as Stroke[],
            );
          }
          break;
        }
        case "erase-strokes": {
          const snapshot =
            direction === "undo"
              ? entry.snapshotBefore
              : entry.snapshotAfter;
          result = engineRef.current.applyStrokes(
            snapshot.strokes as Stroke[],
          );
          break;
        }
        case "replace-document": {
          const snapshot =
            direction === "undo"
              ? entry.snapshotBefore
              : entry.snapshotAfter;
          result = engineRef.current.applyStrokes(
            snapshot.strokes as Stroke[],
          );
          break;
        }
        case "add-textbox":
        case "delete-textbox":
        case "edit-textbox":
        case "resize-textbox":
        case "move-textbox": {
          textBoxActionsRef.current?.applyHistoryEntry(entry, direction);
          return;
        }
        default: {
          const _exhaustive: never = entry;
          throw new Error(
            `Unknown history entry type: ${(_exhaustive as any).type}`,
          );
        }
      }
      replaceCommittedStrokes(result!.document.strokes, result!.strokeBounds);
      syncCanvasHeightFromMaxY(result!.maxY);
      notifyChange();
    },
    [
      replaceCommittedStrokes,
      syncCanvasHeightFromMaxY,
      notifyChange,
      textBoxActionsRef,
    ],
  );

  const undo = useCallback(() => {
    const entry = historyRef.current.undo();
    if (!entry) return;
    applyHistoryState(entry, "undo");
  }, [applyHistoryState]);

  const redo = useCallback(() => {
    const entry = historyRef.current.redo();
    if (!entry) return;
    applyHistoryState(entry, "redo");
  }, [applyHistoryState]);

  return {
    engineRef,
    historyRef,
    normalizedPenStrokeWidth,
    eraserCursor,
    setEraserCursor,
    startStroke,
    addPoint,
    finalizeStroke,
    eraseAtPoint,
    forceCommitActiveSession,
    cancelDraw,
    clear,
    getStrokes,
    setStrokes: setStrokesFromOutside,
    undo,
    redo,
    captureSnapshot,
    notifyChange,
    handlePredictedSamples,
  };
}
