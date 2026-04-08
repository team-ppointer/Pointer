import { useCallback, useMemo, useRef, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import type { InputEvent, PointerType } from "../model/drawingTypes";
import type { CancelReason, InputPhase } from "./inputTypes";
import type { InputAdapter, InputAdapterConfig } from "./inputAdapterTypes";

const RNGH_POINTER_TYPE_MAP: Record<number, PointerType> = {
  0: "touch",
  1: "pen",
  2: "mouse",
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

const createInputEventFromRngh = (
  event: RnghEventLike,
  timestamp: number,
): InputEvent => {
  const pointerType = RNGH_POINTER_TYPE_MAP[(event as any).pointerType as number] ?? "unknown";
  const stylus = event.stylusData;
  return {
    x: event.x,
    y: event.y,
    timestamp,
    pointerType,
    ...(stylus?.pressure !== undefined ? { pressure: stylus.pressure } : {}),
    ...(stylus?.tiltX !== undefined ? { tiltX: stylus.tiltX } : {}),
    ...(stylus?.tiltY !== undefined ? { tiltY: stylus.tiltY } : {}),
  };
};

export const useRnghPanAdapter = ({
  eraserMode,
  minDistance,
  callbacks,
}: InputAdapterConfig): InputAdapter<ReturnType<typeof Gesture.Pan>> => {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const phaseShared = useSharedValue<InputPhase>("idle");
  const [phase, setPhase] = useState<InputPhase>("idle");

  const transitionPhase = useCallback((next: InputPhase) => {
    setPhase(next);
  }, []);

  const handleDrawStart = useCallback(
    (input: InputEvent) => {
      transitionPhase("began");
      callbacksRef.current.onDrawStart(input);
    },
    [transitionPhase],
  );

  const handleDrawMove = useCallback(
    (input: InputEvent) => {
      transitionPhase("active");
      callbacksRef.current.onDrawMove(input);
    },
    [transitionPhase],
  );

  const handleEraseStart = useCallback(
    (input: InputEvent) => {
      callbacksRef.current.onEraseStart(input);
    },
    [],
  );

  const handleEraseMove = useCallback(
    (input: InputEvent) => {
      callbacksRef.current.onEraseMove(input);
    },
    [],
  );

  const handleInteractionBegin = useCallback(() => {
    callbacksRef.current.onInteractionBegin();
  }, []);

  const handleDrawEnd = useCallback(() => {
    transitionPhase("ended");
    callbacksRef.current.onDrawEnd();
  }, [transitionPhase]);

  const handleDrawCancel = useCallback((reason: CancelReason) => {
    transitionPhase("cancelled");
    callbacksRef.current.onDrawCancel(reason);
  }, [transitionPhase]);

  const handleInteractionFinalize = useCallback(() => {
    transitionPhase("idle");
    callbacksRef.current.onInteractionFinalize();
  }, [transitionPhase]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .averageTouches(true)
        .minDistance(minDistance)
        .onBegin(() => {
          "worklet";
          runOnJS(handleInteractionBegin)();
        })
        .onStart((event) => {
          "worklet";
          // RNGH does not expose native event timestamps on the JS thread;
          // Date.now() is the best available approximation. Velocity calculations
          // derived from these timestamps will have ~1-4 ms jitter on the JS thread.
          const input = createInputEventFromRngh(event as unknown as RnghEventLike, Date.now());

          if (eraserMode) {
            runOnJS(handleEraseStart)(input);
            return;
          }

          phaseShared.value = "began";
          runOnJS(handleDrawStart)(input);
        })
        .onUpdate((event) => {
          "worklet";
          const input = createInputEventFromRngh(event as unknown as RnghEventLike, Date.now());

          if (eraserMode) {
            runOnJS(handleEraseMove)(input);
            return;
          }

          phaseShared.value = "active";
          runOnJS(handleDrawMove)(input);
        })
        .onEnd(() => {
          "worklet";

          if (eraserMode) {
            return;
          }

          phaseShared.value = "ended";
          runOnJS(handleDrawEnd)();
        })
        .onFinalize(() => {
          "worklet";

          if (phaseShared.value === "began" || phaseShared.value === "active") {
            phaseShared.value = "cancelled";
            runOnJS(handleDrawCancel)("gesture_failed" as CancelReason);
          }

          phaseShared.value = "idle";
          runOnJS(handleInteractionFinalize)();
        }),
    [
      phaseShared,
      eraserMode,
      minDistance,
      handleInteractionBegin,
      handleDrawStart,
      handleDrawMove,
      handleEraseStart,
      handleEraseMove,
      handleDrawEnd,
      handleDrawCancel,
      handleInteractionFinalize,
    ],
  );

  return { gesture, state: { phase } };
};
