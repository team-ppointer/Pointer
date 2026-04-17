import { useCallback, useMemo, useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import type { InputEvent, PointerType } from '../model/drawingTypes';
import { OneEuroFilter2D } from '../model/oneEuroFilter';

import type { CancelReason, InputPhase } from './inputTypes';
import type { InputAdapter, InputAdapterConfig } from './inputAdapterTypes';

const RNGH_POINTER_TYPE_MAP: Record<number, PointerType> = {
  0: 'touch',
  1: 'pen',
  2: 'mouse',
};

type RnghStylusData = {
  pressure: number;
  tiltX: number;
  tiltY: number;
};

type RnghEventLike = {
  x: number;
  y: number;
  pointerType?: number;
  stylusData?: RnghStylusData;
};

const createInputEventFromRngh = (event: RnghEventLike, timestamp: number): InputEvent => {
  'worklet';
  const pointerType =
    RNGH_POINTER_TYPE_MAP[(event as unknown as { pointerType: number }).pointerType] ?? 'unknown';
  const stylus = event.stylusData;
  const input: InputEvent = { x: event.x, y: event.y, timestamp, pointerType };
  if (stylus) {
    if (stylus.pressure !== undefined) input.pressure = stylus.pressure;
    if (stylus.tiltX !== undefined) input.tiltX = stylus.tiltX;
    if (stylus.tiltY !== undefined) input.tiltY = stylus.tiltY;
  }
  return input;
};

export const useRnghPanAdapter = ({
  eraserMode,
  pencilOnly,
  minDistance,
  callbacks,
  enabled = true,
}: InputAdapterConfig & { enabled?: boolean }): InputAdapter<ReturnType<typeof Gesture.Pan>> => {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const phaseShared = useSharedValue<InputPhase>('idle');
  const phaseRef = useRef<InputPhase>('idle');

  // 1€ filter for 60Hz finger/RNGH input (noisier than 240Hz Apple Pencil)
  const filterRef = useRef(new OneEuroFilter2D({ minCutoff: 3.0, beta: 0.01, dCutoff: 1.0 }));

  const eraserModeShared = useSharedValue(eraserMode);
  eraserModeShared.value = eraserMode;
  const pencilOnlyShared = useSharedValue(pencilOnly);
  pencilOnlyShared.value = pencilOnly;

  const transitionPhase = useCallback((next: InputPhase) => {
    phaseRef.current = next;
  }, []);

  const handleDrawStart = useCallback(
    (input: InputEvent) => {
      filterRef.current.reset();
      const f = filterRef.current.filter(input.x, input.y, input.timestamp);
      transitionPhase('began');
      callbacksRef.current.onDrawStart({ ...input, x: f.x, y: f.y });
    },
    [transitionPhase]
  );

  const handleDrawMove = useCallback(
    (input: InputEvent) => {
      const f = filterRef.current.filter(input.x, input.y, input.timestamp);
      transitionPhase('active');
      callbacksRef.current.onDrawMove({ ...input, x: f.x, y: f.y });
    },
    [transitionPhase]
  );

  const handleEraseStart = useCallback((input: InputEvent) => {
    callbacksRef.current.onEraseStart(input);
  }, []);

  const handleEraseMove = useCallback((input: InputEvent) => {
    callbacksRef.current.onEraseMove(input);
  }, []);

  const handleInteractionBegin = useCallback(() => {
    callbacksRef.current.onInteractionBegin();
  }, []);

  const handleDrawEnd = useCallback(() => {
    transitionPhase('ended');
    callbacksRef.current.onDrawEnd();
  }, [transitionPhase]);

  const handleDrawCancel = useCallback(
    (reason: CancelReason) => {
      transitionPhase('cancelled');
      callbacksRef.current.onDrawCancel(reason);
    },
    [transitionPhase]
  );

  const handleInteractionFinalize = useCallback(() => {
    transitionPhase('idle');
    callbacksRef.current.onInteractionFinalize();
  }, [transitionPhase]);

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
          if (
            pencilOnlyShared.value &&
            (event as unknown as { pointerType: number }).pointerType === 0
          ) {
            return;
          }
          // RNGH does not expose native event timestamps on the JS thread;
          // Date.now() is the best available approximation. Velocity calculations
          // derived from these timestamps will have ~1-4 ms jitter on the JS thread.
          const input = createInputEventFromRngh(event as unknown as RnghEventLike, Date.now());

          phaseShared.value = 'began';

          if (eraserModeShared.value) {
            runOnJS(handleEraseStart)(input);
            return;
          }
          runOnJS(handleDrawStart)(input);
        })
        .onUpdate((event) => {
          'worklet';
          if (
            pencilOnlyShared.value &&
            (event as unknown as { pointerType: number }).pointerType === 0
          ) {
            return;
          }
          const input = createInputEventFromRngh(event as unknown as RnghEventLike, Date.now());

          phaseShared.value = 'active';

          if (eraserModeShared.value) {
            runOnJS(handleEraseMove)(input);
            return;
          }
          runOnJS(handleDrawMove)(input);
        })
        .onEnd(() => {
          'worklet';

          phaseShared.value = 'ended';

          if (eraserModeShared.value) {
            return;
          }
          runOnJS(handleDrawEnd)();
        })
        .onFinalize(() => {
          'worklet';

          if (
            !eraserModeShared.value &&
            (phaseShared.value === 'began' || phaseShared.value === 'active')
          ) {
            phaseShared.value = 'cancelled';
            runOnJS(handleDrawCancel)('gesture_failed' as CancelReason);
          }

          phaseShared.value = 'idle';
          runOnJS(handleInteractionFinalize)();
        }),
    [
      enabled,
      phaseShared,
      eraserModeShared,
      pencilOnlyShared,
      minDistance,
      handleInteractionBegin,
      handleDrawStart,
      handleDrawMove,
      handleEraseStart,
      handleEraseMove,
      handleDrawEnd,
      handleDrawCancel,
      handleInteractionFinalize,
    ]
  );

  return { gesture, state: { phase: phaseRef.current } };
};
