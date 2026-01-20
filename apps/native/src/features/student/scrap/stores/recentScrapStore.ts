import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecentScrapItem {
  scrapId: number;
  folderId?: number | null;
}

interface RecentScrapStore {
  /** 최근 본 스크랩 ID 목록 (최신순) */
  scraps: RecentScrapItem[];
  /** 스크랩 추가 */
  addScrap: (scrapId: number, folderId?: number | undefined) => void;
  /** 스크랩 제거 */
  removeScrap: (scrapId: number) => void;
  /** 폴더 내 스크랩 제거 */
  removeScrapsByFolderId: (folderId: number) => void;
  /** 전체 초기화 */
  clear: () => void;
}

export const useRecentScrapStore = create<RecentScrapStore>()(
  persist(
    (set) => ({
      scraps: [],

      addScrap: (scrapId, folderId) =>
        set((state) => {
          // 중복 제거 후 맨 앞에 추가
          const filtered = state.scraps.filter((item) => item.scrapId !== scrapId);
          return {
            scraps: [{ scrapId, folderId }, ...filtered].slice(0, 30),
          };
        }),

      removeScrap: (scrapId) =>
        set((state) => ({
          scraps: state.scraps.filter((item) => item.scrapId !== scrapId),
        })),

      removeScrapsByFolderId: (folderId) =>
        set((state) => ({
          scraps: state.scraps.filter((item) => item.folderId !== folderId),
        })),

      clear: () => set({ scraps: [] }),
    }),
    {
      name: 'recent-scrap-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
