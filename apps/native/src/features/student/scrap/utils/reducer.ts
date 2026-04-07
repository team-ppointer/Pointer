/**
 * 스크랩 아이템 선택 상태 관리
 * id와 type을 함께 저장하여 같은 id를 가진 FOLDER와 SCRAP을 구분
 * root 스크랩을 나타내기 위해 FOLDER 타입의 id는 undefined일 수 있음
 * SCRAP 타입의 id는 항상 number
 */
export type SelectedItem =
  | { id: number; type: 'SCRAP' }
  | { id: number | undefined; type: 'FOLDER' };

export interface State {
  /** 선택 모드 활성화 여부 */
  isSelecting: boolean;
  /** 선택된 아이템 목록 (id와 type을 함께 저장) */
  selectedItems: SelectedItem[];
}

/**
 * 선택 액션 타입
 */
export type Action =
  | { type: 'ENTER_SELECTION' }
  | { type: 'EXIT_SELECTION' }
  | { type: 'SELECTING_ITEM'; id: number | undefined; itemType: 'FOLDER' | 'SCRAP' }
  | { type: 'SELECT_ALL'; allItems: SelectedItem[] }
  | { type: 'CLEAR_SELECTION' };

/**
 * 초기 선택 상태
 */
export const initialSelectionState: State = {
  isSelecting: false,
  selectedItems: [],
};

/**
 * 선택된 아이템인지 확인하는 헬퍼 함수
 * root 스크랩을 나타내기 위해 id는 undefined일 수 있음
 */
export function isItemSelected(
  selectedItems: SelectedItem[],
  id: number | undefined,
  type: 'FOLDER' | 'SCRAP'
): boolean {
  return selectedItems.some((item) => item.id === id && item.type === type);
}

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
      const { id, itemType } = action;
      const exists = isItemSelected(state.selectedItems, id, itemType);

      // 타입에 맞는 SelectedItem 생성
      const newItem: SelectedItem =
        itemType === 'SCRAP'
          ? { id: id as number, type: 'SCRAP' }
          : { id: id ?? undefined, type: 'FOLDER' };

      return {
        ...state,
        selectedItems: exists
          ? state.selectedItems.filter((item) => !(item.id === id && item.type === itemType))
          : [...state.selectedItems, newItem],
      };
    }

    case 'SELECT_ALL':
      return { ...state, selectedItems: action.allItems };

    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: [] };

    default: {
      // Exhaustive check: 모든 액션 타입이 처리되었는지 확인
      const _exhaustive: never = action;
      return state;
    }
  }
}
