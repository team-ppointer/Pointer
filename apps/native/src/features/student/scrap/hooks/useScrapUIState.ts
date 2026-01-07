import { useReducer, useCallback } from 'react';

export interface ScrapUIState {
  selectedFilter: number;
  isProblemExpanded: boolean;
  isHoveringProblem: boolean;
  showSave: boolean;
}

type ScrapUIAction =
  | { type: 'SET_SELECTED_FILTER'; filter: number }
  | { type: 'SET_PROBLEM_EXPANDED'; expanded: boolean }
  | { type: 'SET_HOVERING_PROBLEM'; hovering: boolean }
  | { type: 'SET_SHOW_SAVE'; show: boolean };

const initialState: ScrapUIState = {
  selectedFilter: 0,
  isProblemExpanded: false,
  isHoveringProblem: false,
  showSave: false,
};

function uiReducer(state: ScrapUIState, action: ScrapUIAction): ScrapUIState {
  switch (action.type) {
    case 'SET_SELECTED_FILTER':
      return { ...state, selectedFilter: action.filter };
    case 'SET_PROBLEM_EXPANDED':
      return { ...state, isProblemExpanded: action.expanded };
    case 'SET_HOVERING_PROBLEM':
      return { ...state, isHoveringProblem: action.hovering };
    case 'SET_SHOW_SAVE':
      return { ...state, showSave: action.show };
    default:
      return state;
  }
}

export function useScrapUIState() {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const setSelectedFilter = useCallback((filter: number) => {
    dispatch({ type: 'SET_SELECTED_FILTER', filter });
  }, []);

  const openProblemModal = useCallback(() => {
    dispatch({ type: 'SET_PROBLEM_EXPANDED', expanded: true });
  }, []);

  const closeProblemModal = useCallback(() => {
    dispatch({ type: 'SET_PROBLEM_EXPANDED', expanded: false });
    dispatch({ type: 'SET_HOVERING_PROBLEM', hovering: false });
  }, []);

  const setHoveringProblem = useCallback((hovering: boolean) => {
    dispatch({ type: 'SET_HOVERING_PROBLEM', hovering });
  }, []);

  const showSaveIndicator = useCallback(() => {
    dispatch({ type: 'SET_SHOW_SAVE', show: true });
  }, []);

  const hideSaveIndicator = useCallback(() => {
    dispatch({ type: 'SET_SHOW_SAVE', show: false });
  }, []);

  return {
    // State
    selectedFilter: state.selectedFilter,
    isProblemExpanded: state.isProblemExpanded,
    isHoveringProblem: state.isHoveringProblem,
    showSave: state.showSave,

    // Actions
    setSelectedFilter,
    openProblemModal,
    closeProblemModal,
    setHoveringProblem,
    showSaveIndicator,
    hideSaveIndicator,
  };
}
