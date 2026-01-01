import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentScrapStore {
  /** 최근 본 스크랩 ID 목록 (최신순) */
  scrapIds: number[];
  /** 스크랩 추가 */
  addScrap: (scrapId: number) => void;
  /** 스크랩 제거 */
  removeScrap: (scrapId: number) => void;
  /** 전체 초기화 */
  clear: () => void;
}

export const useRecentScrapStore = create<RecentScrapStore>()(
  persist(
    (set) => ({
      scrapIds: [],

      addScrap: (scrapId) =>
        set((state) => {
          // 중복 제거 후 맨 앞에 추가
          const filtered = state.scrapIds.filter((id) => id !== scrapId);
          return {
            scrapIds: [scrapId, ...filtered].slice(0, 30),
          };
        }),

      removeScrap: (scrapId) =>
        set((state) => ({
          scrapIds: state.scrapIds.filter((id) => id !== scrapId),
        })),

      clear: () => set({ scrapIds: [] }),
    }),
    {
      name: 'recent-scrap-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
