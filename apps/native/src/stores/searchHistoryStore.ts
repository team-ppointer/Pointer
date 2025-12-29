import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FilterType, ApiSortKey, SortOrder } from '@/features/student/scrap/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchHistoryStore {
  keywords: string[];
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  clear: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryStore>()(
  persist(
    (set) => ({
      keywords: [],

      addKeyword: (keyword) =>
        set((state) => {
          const trimmed = keyword.trim();
          if (!trimmed) return state;

          const filtered = state.keywords.filter((k) => k !== trimmed);
          return {
            keywords: [trimmed, ...filtered].slice(0, 10),
          };
        }),

      removeKeyword: (keyword) =>
        set((state) => ({
          keywords: state.keywords.filter((k) => k !== keyword),
        })),

      clear: () => set({ keywords: [] }),
    }),
    {
      name: 'search-history-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

interface ScrapUIStore {
  /** 현재 선택된 폴더 ID */
  currentFolderId: number | null;
  /** 선택 모드 활성화 여부 */
  isSelectionMode: boolean;
  /** 현재 필터 (ALL/FOLDER/SCRAP) */
  currentFilter: FilterType;
  /** 현재 정렬 키 (CREATED_AT/NAME) */
  currentSort: ApiSortKey;
  /** 현재 정렬 방향 (ASC/DESC) */
  currentOrder: SortOrder;

  /** 현재 폴더 ID 설정 */
  setCurrentFolderId: (id: number | null) => void;
  /** 선택 모드 설정 */
  setSelectionMode: (enabled: boolean) => void;
  /** 필터 설정 */
  setFilter: (filter: FilterType) => void;
  /** 정렬 설정 */
  setSort: (sort: ApiSortKey, order: SortOrder) => void;
  /** 상태 초기화 */
  reset: () => void;
}

const initialScrapUIState = {
  currentFolderId: null,
  isSelectionMode: false,
  currentFilter: 'ALL' as FilterType,
  currentSort: 'CREATED_AT' as ApiSortKey,
  currentOrder: 'DESC' as SortOrder,
};
export const useScrapUIStore = create<ScrapUIStore>()(
  persist(
    (set) => ({
      ...initialScrapUIState,

      setCurrentFolderId: (id) => set({ currentFolderId: id }),
      setSelectionMode: (enabled) => set({ isSelectionMode: enabled }),
      setFilter: (filter) => set({ currentFilter: filter }),
      setSort: (sort, order) => set({ currentSort: sort, currentOrder: order }),

      reset: () => set(initialScrapUIState),
    }),
    {
      name: 'scrap-ui-store',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        currentFilter: state.currentFilter,
        currentSort: state.currentSort,
        currentOrder: state.currentOrder,
      }),
    }
  )
);
