import { type ReactNode } from 'react';

import { type DrawingInputCallbacks } from './inputTypes';

export type InputAdapterConfig = {
  eraserMode: boolean;
  pencilOnly: boolean;
  minDistance: number;
  callbacks: DrawingInputCallbacks;
};

export type InputAdapter<TGesture = unknown> = {
  gesture: TGesture;
};

export type InputOverlayAdapter = {
  overlay: ReactNode;
};
