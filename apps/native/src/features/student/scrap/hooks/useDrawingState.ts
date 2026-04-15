import { useReducer, useCallback } from 'react';
import type { ActiveTool } from '@repo/pointer-native-drawing';

export type DrawingMode = ActiveTool;

export interface DrawingState {
  mode: DrawingMode;
  strokeColor: string;
  strokeWidth: number;
  eraserSize: number;
  hasUnsavedChanges: boolean;
}

type DrawingAction =
  | { type: 'SET_MODE'; mode: DrawingMode }
  | { type: 'SET_STROKE_COLOR'; color: string }
  | { type: 'SET_STROKE_WIDTH'; width: number }
  | { type: 'SET_ERASER_SIZE'; size: number }
  | { type: 'SET_UNSAVED_CHANGES'; hasChanges: boolean }
  | { type: 'MARK_AS_SAVED' }
  | { type: 'RESET' };

const DEFAULT_STROKE_COLOR = '#1E1E21';

const initialState: DrawingState = {
  mode: 'pen',
  strokeColor: DEFAULT_STROKE_COLOR,
  strokeWidth: 2,
  eraserSize: 22,
  hasUnsavedChanges: false,
};

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_STROKE_COLOR':
      return { ...state, strokeColor: action.color };
    case 'SET_STROKE_WIDTH':
      return { ...state, strokeWidth: action.width };
    case 'SET_ERASER_SIZE':
      return { ...state, eraserSize: action.size };
    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.hasChanges };
    case 'MARK_AS_SAVED':
      return { ...state, hasUnsavedChanges: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useDrawingState() {
  const [state, dispatch] = useReducer(drawingReducer, initialState);

  const setPenMode = useCallback(() => {
    dispatch({ type: 'SET_MODE', mode: 'pen' });
  }, []);

  const setEraserMode = useCallback(() => {
    dispatch({ type: 'SET_MODE', mode: 'eraser' });
  }, []);

  const setTextBoxMode = useCallback(() => {
    dispatch({ type: 'SET_MODE', mode: 'textbox' });
  }, []);

  const setStrokeColor = useCallback((color: string) => {
    dispatch({ type: 'SET_STROKE_COLOR', color });
  }, []);

  const setStrokeWidth = useCallback((width: number) => {
    dispatch({ type: 'SET_STROKE_WIDTH', width });
  }, []);

  const setEraserSize = useCallback((size: number) => {
    dispatch({ type: 'SET_ERASER_SIZE', size });
  }, []);

  const markAsSaved = useCallback(() => {
    dispatch({ type: 'MARK_AS_SAVED' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    // State
    mode: state.mode,
    isPenMode: state.mode === 'pen',
    isEraserMode: state.mode === 'eraser',
    isTextBoxMode: state.mode === 'textbox',
    strokeColor: state.strokeColor,
    strokeWidth: state.strokeWidth,
    eraserSize: state.eraserSize,
    hasUnsavedChanges: state.hasUnsavedChanges,

    // Actions
    setPenMode,
    setEraserMode,
    setTextBoxMode,
    setStrokeColor,
    setStrokeWidth,
    setEraserSize,
    markAsUnsaved: useCallback(() => {
      dispatch({ type: 'SET_UNSAVED_CHANGES', hasChanges: true });
    }, []),
    markAsSaved,
    reset,
  };
}
