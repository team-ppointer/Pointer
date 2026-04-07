import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentScrapStore {
  /** 최근 본 스크랩 ID 목록 (최신순) */
  scrapIds: number[];
  /** 스크랩 ID 추가 (이미 존재하면 맨 앞으로 이동) */
  addScrapId: (scrapId: number) => void;
  /** 스크랩 ID 제거 */
  removeScrapId: (scrapId: number) => void;
  /** 스크랩 ID 목록으로 일괄 제거 */
  removeScrapIds: (scrapIds: number[]) => void;
  /** 전체 초기화 */
  clear: () => void;
}

export const useRecentScrapStore = create<RecentScrapStore>()(
  persist(
    (set) => ({
      scrapIds: [],

      addScrapId: (scrapId) =>
        set((state) => {
          // 이미 존재하면 제거 후 맨 앞에 추가
          const filtered = state.scrapIds.filter((id) => id !== scrapId);
          return {
            scrapIds: [scrapId, ...filtered].slice(0, 30),
          };
        }),

      removeScrapId: (scrapId) =>
        set((state) => ({
          scrapIds: state.scrapIds.filter((id) => id !== scrapId),
        })),

      removeScrapIds: (scrapIds) =>
        set((state) => {
          const scrapIdsSet = new Set(scrapIds);
          return {
            scrapIds: state.scrapIds.filter((id) => !scrapIdsSet.has(id)),
          };
        }),

      clear: () => set({ scrapIds: [] }),
    }),
    {
      name: 'recent-scrap-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
