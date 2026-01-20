import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScrapDetailResp } from '../utils/types';

interface RecentScrapItem {
  scrapDetail: ScrapDetailResp;
}

interface RecentScrapStore {
  /** 최근 본 스크랩 목록 (최신순) */
  scraps: RecentScrapItem[];
  /** 스크랩 추가 (이미 존재하면 최신 정보로 업데이트) */
  addScrap: (scrapDetail: ScrapDetailResp) => void;
  /** 스크랩 제거 */
  removeScrap: (scrapId: number) => void;
  /** 스크랩 ID 목록으로 일괄 제거 */
  removeScrapsByIds: (scrapIds: number[]) => void;
  /** 전체 초기화 */
  clear: () => void;
}

export const useRecentScrapStore = create<RecentScrapStore>()(
  persist(
    (set) => ({
      scraps: [],

      addScrap: (scrapDetail) =>
        set((state) => {
          // 이미 존재하는 스크랩인지 확인
          const existingIndex = state.scraps.findIndex(
            (item) => item.scrapDetail.id === scrapDetail.id
          );

          if (existingIndex !== -1) {
            // 이미 존재하면 최신 정보로 업데이트하고 맨 앞으로 이동
            const filtered = state.scraps.filter((item) => item.scrapDetail.id !== scrapDetail.id);
            return {
              scraps: [{ scrapDetail }, ...filtered].slice(0, 30),
            };
          } else {
            // 새 스크랩이면 맨 앞에 추가
            return {
              scraps: [{ scrapDetail }, ...state.scraps].slice(0, 30),
            };
          }
        }),

      removeScrap: (scrapId) =>
        set((state) => ({
          scraps: state.scraps.filter((item) => item.scrapDetail.id !== scrapId),
        })),

      removeScrapsByIds: (scrapIds) =>
        set((state) => {
          const scrapIdsSet = new Set(scrapIds);
          return {
            scraps: state.scraps.filter((item) => !scrapIdsSet.has(item.scrapDetail.id)),
          };
        }),

      clear: () => set({ scraps: [] }),
    }),
    {
      name: 'recent-scrap-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
