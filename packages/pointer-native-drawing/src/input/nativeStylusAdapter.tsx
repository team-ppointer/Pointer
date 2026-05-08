import React, { useCallback, useMemo, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { type InputEvent } from '../model/drawingTypes';
import StylusInputView from '../specs/StylusInputViewNativeComponent';

import { type DrawingInputCallbacks } from './inputTypes';
import { type InputOverlayAdapter } from './inputAdapterTypes';

type StylusTouchPayload = {
  phase: number;
  pointerType: number;
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

// UITouch.timestamp (uptime ms) → epoch ms 변환
const BOOT_TIME_OFFSET_MS = Date.now() - performance.now();

function uptimeMsToEpochMs(uptimeMs: number): number {
  return uptimeMs + BOOT_TIME_OFFSET_MS;
}

function unpackTouches(
  xs: readonly number[],
  ys: readonly number[],
  timestamps: readonly number[],
  forces: readonly number[],
  altitudes: readonly number[],
  azimuths: readonly number[],
  pointerType: 'pen' | 'touch'
): InputEvent[] {
  const count = xs.length;
  const events: InputEvent[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const alt = altitudes[i];
    const az = azimuths[i];
    let tiltX: number;
    let tiltY: number;

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
};

export function useNativeStylusAdapter(
  config: NativeStylusAdapterConfig
): InputOverlayAdapter | null {
  const configRef = useRef(config);
  configRef.current = config;

  const handleStylusTouch = useCallback((event: { nativeEvent: StylusTouchPayload }) => {
    const { nativeEvent } = event;
    const { callbacks, eraserMode } = configRef.current;
    const isPencil = nativeEvent.pointerType === 1;
    const ptrType = isPencil ? ('pen' as const) : ('touch' as const);

    const inputs = unpackTouches(
      nativeEvent.xs,
      nativeEvent.ys,
      nativeEvent.timestamps,
      nativeEvent.forces,
      nativeEvent.altitudes,
      nativeEvent.azimuths,
      ptrType
    );

    if (inputs.length === 0) return;

    switch (nativeEvent.phase) {
      case 0: {
        callbacks.onInteractionBegin();
        if (eraserMode) {
          callbacks.onEraseStart(inputs[0]);
          for (let i = 1; i < inputs.length; i++) callbacks.onEraseMove(inputs[i]);
        } else {
          callbacks.onDrawStart(inputs[0]);
          for (let i = 1; i < inputs.length; i++) callbacks.onDrawMove(inputs[i]);
        }
        break;
      }
      case 1: {
        if (eraserMode) {
          for (let i = 0; i < inputs.length; i++) callbacks.onEraseMove(inputs[i]);
        } else {
          for (let i = 0; i < inputs.length; i++) callbacks.onDrawMove(inputs[i]);
        }
        break;
      }
      case 2: {
        if (eraserMode) {
          for (let i = 0; i < inputs.length; i++) callbacks.onEraseMove(inputs[i]);
        } else {
          for (let i = 0; i < inputs.length; i++) callbacks.onDrawMove(inputs[i]);
          callbacks.onDrawEnd();
        }
        callbacks.onInteractionFinalize();
        break;
      }
      case 3: {
        if (!eraserMode) {
          callbacks.onDrawCancel('interrupted');
        }
        callbacks.onInteractionFinalize();
        break;
      }
    }
  }, []);

  const overlay = useMemo(
    () =>
      Platform.OS === 'ios' ? (
        <StylusInputView style={StyleSheet.absoluteFill} onStylusTouch={handleStylusTouch} />
      ) : null,
    [handleStylusTouch]
  );

  if (Platform.OS !== 'ios') return null;

  return { overlay };
}
