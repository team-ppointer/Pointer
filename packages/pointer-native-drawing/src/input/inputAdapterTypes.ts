import type { ReactNode } from "react";
import type { DrawingInputCallbacks, InputPhase } from "./inputTypes";

export type InputAdapterConfig = {
  eraserMode: boolean;
  minDistance: number;
  callbacks: DrawingInputCallbacks;
};

export type InputAdapterState = {
  readonly phase: InputPhase;
};

export type InputAdapter<TGesture = unknown> = {
  gesture: TGesture;
  state: InputAdapterState;
};

export type InputOverlayAdapter = {
  overlay: ReactNode;
  state: InputAdapterState;
};
