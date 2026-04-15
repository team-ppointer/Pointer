import React, { useCallback, useMemo, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import type { InputEvent } from "../model/drawingTypes";
import type { DrawingInputCallbacks } from "./inputTypes";
import type { InputOverlayAdapter } from "./inputAdapterTypes";
import type { InputPhase } from "./inputTypes";
import StylusInputView from "../specs/StylusInputViewNativeComponent";
import { OneEuroFilter2D } from "../model/oneEuroFilter";

type StylusTouchPayload = {
  phase: number;
  pointerType: number; // 0=touch (finger), 1=pencil
  xs: readonly number[];
  ys: readonly number[];
  timestamps: readonly number[];
  forces: readonly number[];
  altitudes: readonly number[];
  azimuths: readonly number[];
  predictedXs: readonly number[];
  predictedYs: readonly number[];
  predictedTimestamps: readonly number[];
  predictedForces: readonly number[];
  predictedAltitudes: readonly number[];
  predictedAzimuths: readonly number[];
};

const RAD_TO_DEG = 180 / Math.PI;

// UITouch.timestamp is seconds since system boot (mach_absolute_time domain).
// RNGH adapter uses Date.now() (epoch ms). To keep DrawingEngine's velocity
// calculations and eraser throttling consistent, we convert system-uptime
// timestamps to epoch ms by computing the boot-time offset once.
// performance.now() returns ms since a fixed origin close to process start;
// Date.now() - performance.now() ≈ epoch ms at process start.
// UITouch.timestamp * 1000 ≈ ms since boot.
// Offset = Date.now() - performance.now() - (system uptime converted to this domain)
// In practice, performance.now() origin is close enough to system boot on iOS
// that: epochMs ≈ uptimeMs + (Date.now() - performance.now())
const BOOT_TIME_OFFSET_MS = Date.now() - performance.now();

function uptimeMsToEpochMs(uptimeMs: number): number {
  return uptimeMs + BOOT_TIME_OFFSET_MS;
}

function unpackTouches(
  xs: readonly number[], ys: readonly number[],
  timestamps: readonly number[], forces: readonly number[],
  altitudes: readonly number[], azimuths: readonly number[],
  pointerType: "pen" | "touch",
): InputEvent[] {
  const count = xs.length;
  const events: InputEvent[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const alt = altitudes[i];
    const az = azimuths[i];
    let tiltX: number, tiltY: number;

    if (alt >= Math.PI / 2) {
      tiltX = 0;
      tiltY = 0;
    } else if (alt <= 0) {
      tiltX = Math.round(Math.atan2(Math.cos(az), 0) * RAD_TO_DEG);
      tiltY = Math.round(Math.atan2(Math.sin(az), 0) * RAD_TO_DEG);
    } else {
      const tanAlt = Math.tan(alt);
      tiltX = Math.round(Math.atan2(Math.cos(az), tanAlt) * RAD_TO_DEG);
      tiltY = Math.round(Math.atan2(Math.sin(az), tanAlt) * RAD_TO_DEG);
    }

    events[i] = {
      x: xs[i],
      y: ys[i],
      timestamp: uptimeMsToEpochMs(timestamps[i]),
      pressure: forces[i],
      pointerType,
      tiltX,
      tiltY,
    };
  }

  return events;
}

export type NativeStylusAdapterConfig = {
  callbacks: DrawingInputCallbacks;
  eraserMode: boolean;
  acceptFingerInput?: boolean;
};

export function useNativeStylusAdapter(
  config: NativeStylusAdapterConfig,
): InputOverlayAdapter | null {
  const configRef = useRef(config);
  configRef.current = config;

  const phaseRef = useRef<InputPhase>("idle");

  // 1€ filter for native finger input (coalesced data is cleaner than RNGH,
  // so we use a weaker filter: higher minCutoff = less smoothing)
  const fingerFilterRef = useRef(new OneEuroFilter2D({ minCutoff: 10.0, beta: 0.05, dCutoff: 1.0 }));

  const handleStylusTouch = useCallback(
    (event: { nativeEvent: StylusTouchPayload }) => {
      const { nativeEvent } = event;
      const { callbacks, eraserMode } = configRef.current;
      const isPencil = nativeEvent.pointerType === 1;
      const ptrType = isPencil ? "pen" as const : "touch" as const;

      const inputs = unpackTouches(
        nativeEvent.xs, nativeEvent.ys, nativeEvent.timestamps,
        nativeEvent.forces, nativeEvent.altitudes, nativeEvent.azimuths,
        ptrType,
      );

      if (inputs.length === 0) {
        return;
      }

      // Light 1€ filter for finger input — native coalesced is cleaner than RNGH
      // but still benefits from minimal smoothing to reduce angular artifacts.
      if (!isPencil) {
        if (nativeEvent.phase === 0) {
          fingerFilterRef.current.reset();
        }
        for (const input of inputs) {
          const f = fingerFilterRef.current.filter(input.x, input.y, input.timestamp);
          input.x = f.x;
          input.y = f.y;
        }
      }

      // Unpack predicted touches (rendering only, not committed to stroke).
      // Finger predicted touches cause visible "snap back" on lift — only use for pencil.
      const predicted = isPencil && nativeEvent.predictedXs.length > 0
        ? unpackTouches(
            nativeEvent.predictedXs, nativeEvent.predictedYs,
            nativeEvent.predictedTimestamps, nativeEvent.predictedForces,
            nativeEvent.predictedAltitudes, nativeEvent.predictedAzimuths,
            ptrType,
          )
        : undefined;

      switch (nativeEvent.phase) {
        case 0: {
          // began
          callbacks.onInteractionBegin();
          phaseRef.current = "began";

          if (eraserMode) {
            callbacks.onEraseStart(inputs[0]);
            for (let i = 1; i < inputs.length; i++) {
              callbacks.onEraseMove(inputs[i]);
            }
          } else {
            callbacks.onDrawStart(inputs[0]);
            for (let i = 1; i < inputs.length; i++) {
              callbacks.onDrawMove(inputs[i]);
            }
            if (predicted) callbacks.onPredictedSamples?.(predicted);
          }
          break;
        }
        case 1: {
          // moved
          phaseRef.current = "active";

          if (eraserMode) {
            for (let i = 0; i < inputs.length; i++) {
              callbacks.onEraseMove(inputs[i]);
            }
          } else {
            for (let i = 0; i < inputs.length; i++) {
              callbacks.onDrawMove(inputs[i]);
            }
            if (predicted) callbacks.onPredictedSamples?.(predicted);
          }
          break;
        }
        case 2: {
          // ended
          phaseRef.current = "ended";

          if (eraserMode) {
            for (let i = 0; i < inputs.length; i++) {
              callbacks.onEraseMove(inputs[i]);
            }
          } else {
            for (let i = 0; i < inputs.length; i++) {
              callbacks.onDrawMove(inputs[i]);
            }
            callbacks.onDrawEnd();
          }

          callbacks.onInteractionFinalize();
          phaseRef.current = "idle";
          break;
        }
        case 3: {
          // cancelled
          phaseRef.current = "cancelled";

          if (!eraserMode) {
            callbacks.onDrawCancel("interrupted");
          }

          callbacks.onInteractionFinalize();
          phaseRef.current = "idle";
          break;
        }
      }
    },
    [],
  );

  const overlay = useMemo(
    () =>
      Platform.OS === "ios" ? (
        <StylusInputView
          style={StyleSheet.absoluteFill}
          acceptFingerInput={config.acceptFingerInput ?? false}
          onStylusTouch={handleStylusTouch}
        />
      ) : null,
    [handleStylusTouch],
  );

  if (Platform.OS !== "ios") {
    return null;
  }

  return { overlay, state: { phase: phaseRef.current } };
}
