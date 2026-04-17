import { useCallback, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import type { GestureType } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import type { ViewTransform } from '../transform';
import { IDENTITY_TRANSFORM, screenToCanvas } from '../transform';

export type UseCanvasGestureComposerArgs = {
  enableZoomPan: boolean;
  maxZoomScale: number;
  isTextBoxTool: boolean;
  nativeFingerInput?: boolean;
  viewTransformRef: RefObject<ViewTransform>;
  applyTransform: (t: ViewTransform) => void;
  drawPanGesture: GestureType;
  onTextBoxTap: (canvasX: number, canvasY: number) => void;
};

export function useCanvasGestureComposer({
  enableZoomPan,
  maxZoomScale,
  isTextBoxTool,
  nativeFingerInput = false,
  viewTransformRef,
  applyTransform,
  drawPanGesture,
  onTextBoxTap,
}: UseCanvasGestureComposerArgs) {
  // --- TextBox Tap gesture ---
  const handleTextBoxTapJS = useCallback(
    (x: number, y: number) => {
      const t = viewTransformRef.current;
      let canvasX = x;
      let canvasY = y;
      if (enableZoomPan && (t.scale !== 1 || t.translateX !== 0 || t.translateY !== 0)) {
        const canvas = screenToCanvas(x, y, t);
        canvasX = canvas.x;
        canvasY = canvas.y;
      }
      onTextBoxTap(canvasX, canvasY);
    },
    [enableZoomPan, onTextBoxTap, viewTransformRef]
  );

  const textBoxTapGesture = useMemo(
    () =>
      Gesture.Tap()
        .enabled(isTextBoxTool)
        .onEnd((e) => {
          'worklet';
          runOnJS(handleTextBoxTapJS)(e.x, e.y);
        }),
    [isTextBoxTool, handleTextBoxTapJS]
  );

  // --- Shared flags for pinch/pan coordination (worklet-level) ---
  const pinchDeadShared = useSharedValue(false);
  const pinchActiveShared = useSharedValue(false);

  // --- Pinch gesture (2-finger zoom + pan) ---
  const baseTransformRef = useRef<ViewTransform>(IDENTITY_TRANSFORM);
  const anchorRef = useRef({ x: 0, y: 0 });

  const handlePinchStart = useCallback(
    (focalX: number, focalY: number) => {
      const current = viewTransformRef.current;
      baseTransformRef.current = current;
      anchorRef.current = {
        x: (focalX - current.translateX) / current.scale,
        y: (focalY - current.translateY) / current.scale,
      };
    },
    [viewTransformRef]
  );

  const handlePinchUpdate = useCallback(
    (scale: number, focalX: number, focalY: number) => {
      const base = baseTransformRef.current;
      const newScale = Math.min(Math.max(base.scale * scale, 1), maxZoomScale);
      const anchor = anchorRef.current;
      const newTx = focalX - newScale * anchor.x;
      const newTy = focalY - newScale * anchor.y;

      applyTransform({ scale: newScale, translateX: newTx, translateY: newTy });
    },
    [applyTransform, maxZoomScale]
  );

  const handlePinchEnd = useCallback(() => {
    applyTransform(viewTransformRef.current);
  }, [applyTransform, viewTransformRef]);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onStart((e) => {
          'worklet';
          pinchDeadShared.value = false;
          pinchActiveShared.value = true;
          runOnJS(handlePinchStart)(e.focalX, e.focalY);
        })
        .onUpdate((e) => {
          'worklet';
          if (e.numberOfPointers < 2) {
            if (!pinchDeadShared.value) {
              pinchDeadShared.value = true;
              runOnJS(handlePinchEnd)();
            }
            return;
          }
          if (pinchDeadShared.value) return;
          runOnJS(handlePinchUpdate)(e.scale, e.focalX, e.focalY);
        })
        .onEnd(() => {
          'worklet';
          pinchActiveShared.value = false;
          runOnJS(handlePinchEnd)();
        })
        .onFinalize(() => {
          'worklet';
          pinchActiveShared.value = false;
        }),
    [pinchDeadShared, pinchActiveShared, handlePinchStart, handlePinchUpdate, handlePinchEnd]
  );

  // --- 2-finger pan (canvas panning) ---
  // Suppressed during active pinch to prevent transform conflicts.
  const fingerPanBaseRef = useRef<ViewTransform>(IDENTITY_TRANSFORM);
  const fingerPanActiveRef = useRef(false);

  const handleFingerPanStart = useCallback(() => {
    fingerPanActiveRef.current = true;
    fingerPanBaseRef.current = viewTransformRef.current;
  }, [viewTransformRef]);

  const handleFingerPanUpdate = useCallback(
    (translationX: number, translationY: number) => {
      if (!fingerPanActiveRef.current) return;
      const base = fingerPanBaseRef.current;
      applyTransform({
        scale: base.scale,
        translateX: base.translateX + translationX,
        translateY: base.translateY + translationY,
      });
    },
    [applyTransform]
  );

  const handleFingerPanEnd = useCallback(() => {
    fingerPanActiveRef.current = false;
  }, []);

  const fingerPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .minPointers(2)
        .maxPointers(2)
        .minDistance(1)
        .onStart(() => {
          'worklet';
          if (pinchActiveShared.value) return;
          runOnJS(handleFingerPanStart)();
        })
        .onUpdate((e) => {
          'worklet';
          if (pinchActiveShared.value) return;
          runOnJS(handleFingerPanUpdate)(e.translationX, e.translationY);
        })
        .onFinalize(() => {
          'worklet';
          runOnJS(handleFingerPanEnd)();
        }),
    [pinchActiveShared, handleFingerPanStart, handleFingerPanUpdate, handleFingerPanEnd]
  );

  // --- Composed gesture ---
  const composedGesture = useMemo(() => {
    if (isTextBoxTool) {
      return enableZoomPan
        ? Gesture.Simultaneous(textBoxTapGesture, fingerPanGesture, pinchGesture)
        : textBoxTapGesture;
    }
    if (nativeFingerInput) {
      // 1-finger drawing handled by native recognizer → RNGH only needs 2-finger gestures
      return enableZoomPan ? Gesture.Simultaneous(fingerPanGesture, pinchGesture) : drawPanGesture; // enabled=false dummy, keeps GestureDetector happy
    }
    return enableZoomPan
      ? Gesture.Simultaneous(drawPanGesture, fingerPanGesture, pinchGesture)
      : drawPanGesture;
  }, [
    enableZoomPan,
    nativeFingerInput,
    drawPanGesture,
    fingerPanGesture,
    pinchGesture,
    textBoxTapGesture,
    isTextBoxTool,
  ]);

  return { composedGesture };
}
