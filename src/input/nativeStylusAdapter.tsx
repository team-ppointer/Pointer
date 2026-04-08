import React, { useCallback, useRef } from "react";
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

/**
 * Convert Apple Pencil altitude/azimuth to W3C Pointer Events tiltX/tiltY.
 * Reference: W3C Pointer Events Level 3, section 4.1.5
 *
 * altitude: 0 = parallel to surface, π/2 = perpendicular
 * azimuth: 0 = pointing right (positive x), increases clockwise (UIKit)
 * tiltX/tiltY: degrees from perpendicular, range [-90, 90]
 */
function altitudeAzimuthToTilt(
  altitude: number,
  azimuth: number,
): { tiltX: number; tiltY: number } {
  if (altitude >= Math.PI / 2) {
    // Perfectly perpendicular — no tilt
    return { tiltX: 0, tiltY: 0 };
  }

  if (altitude <= 0) {
    // Fully parallel — clamp to ±90
    const tiltX = Math.round(Math.atan2(Math.cos(azimuth), 0) * RAD_TO_DEG);
    const tiltY = Math.round(Math.atan2(Math.sin(azimuth), 0) * RAD_TO_DEG);
    return { tiltX, tiltY };
  }

  const tanAlt = Math.tan(altitude);
  const tiltX = Math.round(Math.atan2(Math.cos(azimuth), tanAlt) * RAD_TO_DEG);
  const tiltY = Math.round(Math.atan2(Math.sin(azimuth), tanAlt) * RAD_TO_DEG);
  return { tiltX, tiltY };
}

function unpackInputEvents(payload: StylusTouchPayload): InputEvent[] {
  const { xs, ys, timestamps, forces, altitudes, azimuths } = payload;
  const count = xs.length;
  const events: InputEvent[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const { tiltX, tiltY } = altitudeAzimuthToTilt(altitudes[i], azimuths[i]);
    events[i] = {
      x: xs[i],
      y: ys[i],
      timestamp: uptimeMsToEpochMs(timestamps[i]),
      pressure: forces[i],
      pointerType: "pen",
      tiltX,
      tiltY,
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

  if (Platform.OS !== "ios") {
    return null;
  }

  const overlay = (
    <StylusInputView
      style={StyleSheet.absoluteFill}
      onStylusTouch={handleStylusTouch}
    />
  );

  return { overlay, state: { phase: phaseRef.current } };
}
