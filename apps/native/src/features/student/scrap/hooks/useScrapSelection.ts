import { useReducer } from 'react';
import { reducer, initialSelectionState, State, Action } from '../utils/reducer';

/**
 * 스크랩 아이템 선택 상태를 관리하는 커스텀 훅
 *
 * @returns [reducerState, dispatch] - 선택 상태와 디스패치 함수
 *
 * @example
 * const [reducerState, dispatch] = useScrapSelection();
 *
 * // 선택 모드 진입
 * dispatch({ type: 'ENTER_SELECTION' });
 *
 * // 아이템 선택/해제
 * dispatch({ type: 'SELECTING_ITEM', id: 1, itemType: 'SCRAP' });
 *
 * // 선택 모드 종료
 * dispatch({ type: 'EXIT_SELECTION' });
 */
export const useScrapSelection = (): [State, React.Dispatch<Action>] => {
  return useReducer(reducer, initialSelectionState);
};
