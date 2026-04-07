import { useReducer, useCallback } from 'react';

export type DrawingMode = 'pen' | 'eraser' | 'text';

export interface DrawingState {
  mode: DrawingMode;
  strokeWidth: number;
  eraserSize: number;
  hasUnsavedChanges: boolean;
}

type DrawingAction =
  | { type: 'SET_MODE'; mode: DrawingMode }
  | { type: 'SET_STROKE_WIDTH'; width: number }
  | { type: 'SET_ERASER_SIZE'; size: number }
  | { type: 'SET_UNSAVED_CHANGES'; hasChanges: boolean }
  | { type: 'MARK_AS_SAVED' }
  | { type: 'RESET' };

const initialState: DrawingState = {
  mode: 'pen',
  strokeWidth: 2,
  eraserSize: 22,
  hasUnsavedChanges: false,
};

function drawingReducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };
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

  const setTextMode = useCallback(() => {
    dispatch({ type: 'SET_MODE', mode: 'text' });
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
    isTextMode: state.mode === 'text',
    strokeWidth: state.strokeWidth,
    eraserSize: state.eraserSize,
    hasUnsavedChanges: state.hasUnsavedChanges,

    // Actions
    setPenMode,
    setEraserMode,
    setTextMode,
    setStrokeWidth,
    setEraserSize,
    markAsSaved,
    reset,
  };
}
