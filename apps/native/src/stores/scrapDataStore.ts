import { SearchResultItem } from '@/features/student/scrap/components/ScrapItem';
import { DummyItem } from '@/features/student/scrap/components/ScrapItemGrid';
import { create } from 'zustand';

interface ScrapStore {
  data: DummyItem[];
  setData: (newData: DummyItem[]) => void;
  updateItem: (id: string, newTitle: string) => void;
  deleteItem: (ids: string | string[]) => void;
  searchByTitle: (query: string) => { scrap: DummyItem; parentFolderId?: string }[];
}

export const useScrapStore = create<ScrapStore>((set, get) => ({
  data: [],
  setData: (newData) => set({ data: newData }),
  updateItem: (id, newTitle) =>
    set((state) => ({
      data: state.data.map((item) => (item.id === id ? { ...item, title: newTitle } : item)),
    })),
  deleteItem: (ids) =>
    set((state) => {
      const deleteArray = Array.isArray(ids) ? ids : [ids];
      return {
        data: state.data.filter((item) => !deleteArray.includes(item.id)),
      };
    }),
  searchByTitle: (query: string) => {
    const state = get();
    const lowerQuery = query.toLowerCase();

    const results: SearchResultItem[] = [];

    state.data.forEach((item) => {
      if (item.type === 'SCRAP' && item.title.toLowerCase().includes(lowerQuery)) {
        results.push({ scrap: item });
      }

      if (item.type === 'FOLDER' && item.contents) {
        item.contents.forEach((c) => {
          if (c.type === 'SCRAP' && c.title.toLowerCase().includes(lowerQuery)) {
            results.push({ scrap: c, parentFolderName: item.title });
          }
        });
      }
    });

    return results;
  },
}));
