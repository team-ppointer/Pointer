/**
 * 스크랩 아이템 선택 상태 관리
 * API 스키마에 맞게 id를 number로 통일
 */
export interface State {
  /** 선택 모드 활성화 여부 */
  isSelecting: boolean;
  /** 선택된 아이템 ID 목록 (number[]) */
  selectedItems: number[];
}

/**
 * 선택 액션 타입
 */
export type Action =
  | { type: 'ENTER_SELECTION' }
  | { type: 'EXIT_SELECTION' }
  | { type: 'SELECTING_ITEM'; id: number }
  | { type: 'SELECT_ALL'; allIds: number[] }
  | { type: 'CLEAR_SELECTION' };

/**
 * 초기 선택 상태
 */
export const initialSelectionState: State = {
  isSelecting: false,
  selectedItems: [],
};

/**
 * 선택 상태 리듀서
 * @param state - 현재 선택 상태
 * @param action - 수행할 액션
 * @returns 새로운 선택 상태
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
      // Exhaustive check: 모든 액션 타입이 처리되었는지 확인
      const _exhaustive: never = action;
      return state;
    }
  }
}
