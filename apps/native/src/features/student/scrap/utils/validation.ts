import { showToast } from '../components/Notification/Toast';

import { type SelectedItem } from './reducer';

/**
 * 선택된 아이템 중 폴더가 포함되어 있는지 확인하고, 포함되어 있으면 에러 토스트를 표시합니다.
 * 스크랩만 이동 가능한 경우에 사용합니다.
 *
 * @param selectedItems - 선택된 아이템 목록
 * @returns 폴더가 포함되어 있으면 true, 아니면 false
 *
 * @example
 * if (validateOnlyScrapCanMove(reducerState.selectedItems)) {
 *   return; // 폴더가 포함되어 있으면 중단
 * }
 * // 스크랩만 이동하는 로직 계속...
 */
export const validateOnlyScrapCanMove = (selectedItems: SelectedItem[]): boolean => {
  const selectedFolders = selectedItems.filter((selected) => selected.type === 'FOLDER');

  if (selectedFolders.length > 0) {
    showToast('error', '스크랩만 이동이 가능합니다.');
    return true; // 검증 실패 (폴더가 포함됨)
  }

  return false; // 검증 성공 (스크랩만 있음)
};
