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

export const selectState: State = {
  isSelecting: false,
  selectedItems: [],
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ENTER_SELECTION':
      return { ...state, isSelecting: true };
    case 'EXIT_SELECTION':
      return { ...state, isSelecting: false, selectedItems: [] };
    case 'SELECTING_ITEM':
      const id = action.id;
      const exists = state.selectedItems.includes(id);

      return {
        ...state,
        selectedItems: exists
          ? state.selectedItems.filter((i) => i !== id)
          : [...state.selectedItems, id],
      };
    case 'SELECT_ALL':
      return { ...state, selectedItems: action.allIds };
    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: [] };
    default:
      return state;
  }
}
