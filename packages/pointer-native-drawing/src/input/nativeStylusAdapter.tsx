import React, { useCallback, useMemo, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import type { InputEvent } from "../model/drawingTypes";
import type { DrawingInputCallbacks } from "./inputTypes";
import type { InputOverlayAdapter } from "./inputAdapterTypes";
import type { InputPhase } from "./inputTypes";
import StylusInputView from "../specs/StylusInputViewNativeComponent";

type StylusTouchPayload = {
  phase: number;
  xs: readonly number[];
  ys: readonly number[];
  timestamps: readonly number[];
  forces: readonly number[];
  altitudes: readonly number[];
  azimuths: readonly number[];
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

function unpackInputEvents(payload: StylusTouchPayload): InputEvent[] {
  const { xs, ys, timestamps, forces } = payload;
  const count = xs.length;
  const events: InputEvent[] = new Array(count);

  for (let i = 0; i < count; i++) {
    events[i] = {
      x: xs[i],
      y: ys[i],
      timestamp: uptimeMsToEpochMs(timestamps[i]),
      pressure: forces[i],
      pointerType: "pen",
      // tilt computation skipped — tiltSensitivity=0 in fixed-width mode.
      // Re-enable when variable-width or tilt-based rendering is needed:
      // tiltX: computeTiltX(altitudes[i], azimuths[i]),
      // tiltY: computeTiltY(altitudes[i], azimuths[i]),
    };
  }

  return events;
}

export type NativeStylusAdapterConfig = {
  callbacks: DrawingInputCallbacks;
  eraserMode: boolean;
};

export function useNativeStylusAdapter(
  config: NativeStylusAdapterConfig,
): InputOverlayAdapter | null {
  const configRef = useRef(config);
  configRef.current = config;

  const phaseRef = useRef<InputPhase>("idle");

  const handleStylusTouch = useCallback(
    (event: { nativeEvent: StylusTouchPayload }) => {
      const { nativeEvent } = event;
      const { callbacks, eraserMode } = configRef.current;
      const inputs = unpackInputEvents(nativeEvent);

      if (inputs.length === 0) {
        return;
      }

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
