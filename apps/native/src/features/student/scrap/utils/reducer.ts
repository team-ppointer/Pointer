/**
 * Selection state for scrap items
 */
export interface State {
  isSelecting: boolean;
  selectedItems: string[];
}

export type Action =
  | { type: 'ENTER_SELECTION' }
  | { type: 'EXIT_SELECTION' }
  | { type: 'SELECTING_ITEM'; id: string }
  | { type: 'SELECT_ALL'; allIds: string[] }
  | { type: 'CLEAR_SELECTION' };

/**
 * Initial state for selection reducer
 */
export const initialSelectionState: State = {
  isSelecting: false,
  selectedItems: [],
};

/**
 * Reducer for managing selection state of scrap items
 * @param state - Current selection state
 * @param action - Action to perform
 * @returns New selection state
 */
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ENTER_SELECTION':
      return { ...state, isSelecting: true };

    case 'EXIT_SELECTION':
      return { ...state, isSelecting: false, selectedItems: [] };

    case 'SELECTING_ITEM': {
      const { id } = action;
      const exists = state.selectedItems.includes(id);

      return {
        ...state,
        selectedItems: exists
          ? state.selectedItems.filter((i) => i !== id)
          : [...state.selectedItems, id],
      };
    }

    case 'SELECT_ALL':
      return { ...state, selectedItems: action.allIds };

    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: [] };

    default: {
      // Exhaustive check: ensures all action types are handled
      const _exhaustive: never = action;
      return state;
    }
  }
}
