import { type InputEvent } from '../model/drawingTypes';

export type CancelReason = 'gesture_failed' | 'interrupted' | 'unknown';

export type DrawingInputCallbacks = {
  onInteractionBegin: () => void;
  onInteractionFinalize: () => void;
  onDrawStart: (input: InputEvent) => void;
  onDrawMove: (input: InputEvent) => void;
  onDrawEnd: () => void;
  onDrawCancel: (reason?: CancelReason) => void;
  onEraseStart: (input: InputEvent) => void;
  onEraseMove: (input: InputEvent) => void;
};
