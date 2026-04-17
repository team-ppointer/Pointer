import { useCallback, useMemo, useRef } from "react";
import type { RefObject } from "react";
import type { InputEvent } from "../model/drawingTypes";
import type { DocumentSnapshot } from "../engine/HistoryManager";
import type { HistoryManager } from "../engine/HistoryManager";
import { screenToCanvas } from "../transform";
import type { ViewTransform } from "../transform";
import type { CancelReason } from "../input/inputTypes";

export type DrawingActions = {
  startStroke: (input: InputEvent) => void;
  addPoint: (input: InputEvent) => void;
  finalizeStroke: () => void;
  eraseAtPoint: (input: InputEvent) => void;
  cancelDraw: (reason?: CancelReason) => void;
  handlePredictedSamples: (inputs: InputEvent[]) => void;
  captureSnapshot: () => DocumentSnapshot;
  setEraserCursor: (cursor: { x: number; y: number } | null) => void;
  beginEraseTransaction: () => void;
  commitEraseTransaction: () => void;
};

export type UseDrawingInteractionControllerArgs = {
  eraserMode: boolean;
  enableZoomPan: boolean;
  canvasWidth: number;
  historyRef: RefObject<HistoryManager>;
  viewTransformRef: RefObject<ViewTransform>;
  drawingActions: DrawingActions;
  setIsScrollEnabled: (enabled: boolean) => void;
};

export function useDrawingInteractionController({
  eraserMode,
  enableZoomPan,
  canvasWidth,
  historyRef,
  viewTransformRef,
  drawingActions,
  setIsScrollEnabled,
}: UseDrawingInteractionControllerArgs) {
  const {
    startStroke,
    addPoint,
    finalizeStroke,
    eraseAtPoint,
    cancelDraw,
    handlePredictedSamples,
    setEraserCursor,
    beginEraseTransaction,
    commitEraseTransaction,
  } = drawingActions;

  const inputCallbacks = useMemo(
    () => ({
      onInteractionBegin: () => {
        if (!enableZoomPan) setIsScrollEnabled(false);
        if (eraserMode) {
          beginEraseTransaction();
        }
      },
      onInteractionFinalize: () => {
        if (!enableZoomPan) setIsScrollEnabled(true);
        if (eraserMode) {
          commitEraseTransaction();
        }
        setEraserCursor(null);
      },
      onDrawStart: startStroke,
      onDrawMove: addPoint,
      onDrawEnd: finalizeStroke,
      onDrawCancel: (reason) => cancelDraw(reason),
      onEraseStart: eraseAtPoint,
      onEraseMove: eraseAtPoint,
      onPredictedSamples: handlePredictedSamples,
    }),
    [
      addPoint,
      beginEraseTransaction,
      cancelDraw,
      commitEraseTransaction,
      enableZoomPan,
      eraserMode,
      eraseAtPoint,
      finalizeStroke,
      handlePredictedSamples,
      setEraserCursor,
      setIsScrollEnabled,
      startStroke,
    ],
  );

  // Wrap input callbacks: screenToCanvas when zoom active + clamp to canvas bounds
  const transformedCallbacks = useMemo(() => {
    const clampInput = (input: InputEvent): InputEvent => {
      if (canvasWidth <= 0) return input;
      const x = Math.max(0, Math.min(input.x, canvasWidth));
      const y = Math.max(0, input.y);
      if (x === input.x && y === input.y) return input;
      return { ...input, x, y };
    };
    if (!enableZoomPan) {
      return {
        ...inputCallbacks,
        onDrawStart: (input: InputEvent) => inputCallbacks.onDrawStart(clampInput(input)),
        onDrawMove: (input: InputEvent) => inputCallbacks.onDrawMove(clampInput(input)),
        onEraseStart: (input: InputEvent) => inputCallbacks.onEraseStart(clampInput(input)),
        onEraseMove: (input: InputEvent) => inputCallbacks.onEraseMove(clampInput(input)),
        onPredictedSamples: (inputs: InputEvent[]) =>
          inputCallbacks.onPredictedSamples?.(inputs.map(clampInput)),
      };
    }
    const wrapInput = (input: InputEvent): InputEvent => {
      const t = viewTransformRef.current;
      if (t.scale === 1 && t.translateX === 0 && t.translateY === 0) {
        return clampInput(input);
      }
      const canvas = screenToCanvas(input.x, input.y, t);
      return clampInput({ ...input, x: canvas.x, y: canvas.y });
    };
    return {
      ...inputCallbacks,
      onDrawStart: (input: InputEvent) => inputCallbacks.onDrawStart(wrapInput(input)),
      onDrawMove: (input: InputEvent) => inputCallbacks.onDrawMove(wrapInput(input)),
      onEraseStart: (input: InputEvent) => inputCallbacks.onEraseStart(wrapInput(input)),
      onEraseMove: (input: InputEvent) => inputCallbacks.onEraseMove(wrapInput(input)),
      onPredictedSamples: (inputs: InputEvent[]) =>
        inputCallbacks.onPredictedSamples?.(inputs.map(wrapInput)),
    };
  }, [canvasWidth, enableZoomPan, inputCallbacks, viewTransformRef]);

  return { inputCallbacks, transformedCallbacks };
}
