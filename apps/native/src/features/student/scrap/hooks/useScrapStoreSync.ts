import { useEffect, useRef } from 'react';
import { useRecentScrapStore } from '../stores/recentScrapStore';
import { useNoteStore } from '../stores/scrapNoteStore';

/**
 * 유효한 스크랩 ID 목록과 store를 동기화하는 훅
 * - recentScrapStore: 최근 본 스크랩 중 삭제된 항목 제거
 * - scrapNoteStore: 열린 노트 탭 중 삭제된 항목 닫기
 *
 * @param validScrapIds 현재 유효한 스크랩 ID 배열 (undefined면 로딩 중으로 스킵)
 */
export const useScrapStoreSync = (validScrapIds: number[] | undefined) => {
  // recentScrapStore
  const recentScrapIds = useRecentScrapStore((state) => state.scrapIds);
  const removeScrapIds = useRecentScrapStore((state) => state.removeScrapIds);

  // scrapNoteStore
  const openNotes = useNoteStore((state) => state.openNotes);
  const closeNotesByScrapIds = useNoteStore((state) => state.closeNotesByScrapIds);

  // 초기 마운트 시에는 동기화 스킵 (불필요한 정리 방지)
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 첫 마운트 시에는 스킵
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // undefined면 아직 로딩 중 → 스킵
    if (validScrapIds === undefined) {
      return;
    }

    // 빈 배열이면 모든 스크랩이 삭제된 상태 → 정리 실행
    const validSet = new Set(validScrapIds);

    // recentScrapStore 정리
    const invalidRecentIds = recentScrapIds.filter((id) => !validSet.has(id));

    if (invalidRecentIds.length > 0) {
      removeScrapIds(invalidRecentIds);
    }

    // scrapNoteStore 정리 (열린 탭 중 삭제된 스크랩 닫기)
    const invalidNoteIds = openNotes
      .filter((note) => !validSet.has(note.id))
      .map((note) => note.id);

    if (invalidNoteIds.length > 0) {
      closeNotesByScrapIds(invalidNoteIds);
    }
  }, [validScrapIds]);
};
