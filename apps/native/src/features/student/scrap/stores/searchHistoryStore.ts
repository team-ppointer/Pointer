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
