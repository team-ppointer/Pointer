import { useCallback, useMemo, useRef } from 'react';
import { Gesture, PointerType as RnghPointerType } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import { type InputEvent, type PointerType } from '../model/drawingTypes';

import { type DrawingInputCallbacks } from './inputTypes';
import { type InputAdapter, type InputAdapterConfig } from './inputAdapterTypes';

const RNGH_POINTER_TYPE_MAP: Record<number, PointerType> = {
  [RnghPointerType.TOUCH]: 'touch',
  [RnghPointerType.STYLUS]: 'pen',
  [RnghPointerType.MOUSE]: 'mouse',
};

type RnghEventLike = {
  x: number;
  y: number;
  pointerType?: number;
};

const createInputEvent = (event: RnghEventLike, timestamp: number): InputEvent => {
  'worklet';
  const pointerType =
    event.pointerType !== undefined
      ? (RNGH_POINTER_TYPE_MAP[event.pointerType] ?? 'unknown')
      : 'unknown';
  return { x: event.x, y: event.y, timestamp, pointerType };
};

export const useRnghPanAdapter = ({
  eraserMode,
  pencilOnly,
  minDistance,
  callbacks,
  enabled = true,
}: InputAdapterConfig & { enabled?: boolean }): InputAdapter<ReturnType<typeof Gesture.Pan>> => {
  // callbacksRef로 stable closure 유지 — gesture 재생성 트리거 회피
  const callbacksRef = useRef<DrawingInputCallbacks>(callbacks);
  callbacksRef.current = callbacks;

  const eraserModeShared = useSharedValue(eraserMode);
  eraserModeShared.value = eraserMode;
  const pencilOnlyShared = useSharedValue(pencilOnly);
  pencilOnlyShared.value = pencilOnly;
  const isActiveShared = useSharedValue(false);

  const handleInteractionBegin = useCallback(() => {
    callbacksRef.current.onInteractionBegin();
  }, []);

  const handleDrawStart = useCallback((input: InputEvent) => {
    callbacksRef.current.onDrawStart(input);
  }, []);

  const handleDrawMove = useCallback((input: InputEvent) => {
    callbacksRef.current.onDrawMove(input);
  }, []);

  const handleDrawEnd = useCallback(() => {
    callbacksRef.current.onDrawEnd();
  }, []);

  const handleDrawCancel = useCallback(() => {
    callbacksRef.current.onDrawCancel('gesture_failed');
  }, []);

  const handleEraseStart = useCallback((input: InputEvent) => {
    callbacksRef.current.onEraseStart(input);
  }, []);

  const handleEraseMove = useCallback((input: InputEvent) => {
    callbacksRef.current.onEraseMove(input);
  }, []);

  const handleInteractionFinalize = useCallback(() => {
    callbacksRef.current.onInteractionFinalize();
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .maxPointers(1)
        .averageTouches(true)
        .minDistance(minDistance)
        .onBegin(() => {
          'worklet';
          runOnJS(handleInteractionBegin)();
        })
        .onStart((event) => {
          'worklet';
          if (pencilOnlyShared.value && event.pointerType === RnghPointerType.TOUCH) {
            return;
          }
          const input = createInputEvent(event, Date.now());
          isActiveShared.value = true;

          if (eraserModeShared.value) {
            runOnJS(handleEraseStart)(input);
            return;
          }
          runOnJS(handleDrawStart)(input);
        })
        .onUpdate((event) => {
          'worklet';
          if (pencilOnlyShared.value && event.pointerType === RnghPointerType.TOUCH) {
            return;
          }
          const input = createInputEvent(event, Date.now());

          if (eraserModeShared.value) {
            runOnJS(handleEraseMove)(input);
            return;
          }
          runOnJS(handleDrawMove)(input);
        })
        .onEnd(() => {
          'worklet';
          isActiveShared.value = false;
          if (eraserModeShared.value) return;
          runOnJS(handleDrawEnd)();
        })
        .onFinalize(() => {
          'worklet';
          if (!eraserModeShared.value && isActiveShared.value) {
            runOnJS(handleDrawCancel)();
          }
          isActiveShared.value = false;
          runOnJS(handleInteractionFinalize)();
        }),
    [
      enabled,
      minDistance,
      eraserModeShared,
      pencilOnlyShared,
      isActiveShared,
      handleInteractionBegin,
      handleDrawStart,
      handleDrawMove,
      handleDrawEnd,
      handleDrawCancel,
      handleEraseStart,
      handleEraseMove,
      handleInteractionFinalize,
    ]
  );

  return { gesture };
};
