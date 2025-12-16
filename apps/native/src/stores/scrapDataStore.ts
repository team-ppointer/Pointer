import { ScrapItem, TrashItem } from '@/types/test/types';
import { create } from 'zustand';
import { deleteItemsRecursive } from '@/features/student/scrap/utils/itemHelpers';

/**
 * Search result type for better type safety
 */
export interface SearchResult {
  item: ScrapItem;
  parentFolderName?: string;
}

/**
 * ScrapStore manages scrap data: fetch, update, delete, search
 */
interface ScrapStore {
  data: ScrapItem[];
  setData: (newData: ScrapItem[]) => void;
  updateItem: (id: string, newTitle: string, parentFolderId?: string) => void;
  deleteItem: (ids: string | string[], parentFolderId?: string) => void;
  searchByTitle: (query: string) => SearchResult[];
  restoreItem: (item: TrashItem) => void;
}

export const useScrapStore = create<ScrapStore>((set, get) => ({
  data: [],
  setData: (newData) => set({ data: newData }),

  updateItem: (id, newTitle, parentFolderId) =>
    set((state) => {
      if (parentFolderId) {
        // Update item in nested folder
        return {
          data: state.data.map((item) => {
            if (item.id === parentFolderId && item.type === 'FOLDER') {
              return {
                ...item,
                contents: item.contents.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
              };
            }
            return item;
          }),
        };
      }

      // Update item in root
      return {
        data: state.data.map((item) => (item.id === id ? { ...item, title: newTitle } : item)),
      };
    }),

  deleteItem: (ids, parentFolderId) =>
    set((state) => {
      const deleteArray = Array.isArray(ids) ? ids : [ids];

      if (parentFolderId) {
        // Delete from specific folder
        return {
          data: state.data.map((d) => {
            if (d.id === parentFolderId && d.type === 'FOLDER') {
              return {
                ...d,
                contents: deleteItemsRecursive(d.contents, deleteArray),
              };
            }
            return d;
          }),
        };
      }

      // Delete from root
      return { data: deleteItemsRecursive(state.data, deleteArray) };
    }),

  searchByTitle: (query: string) => {
    const state = get();
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];

    const results: SearchResult[] = [];

    state.data.forEach((item) => {
      // Check folder title
      if (item.type === 'FOLDER' && item.title.toLowerCase().includes(lowerQuery)) {
        results.push({ item, parentFolderName: undefined });
      }

      // Check contents of folder
      if (item.type === 'FOLDER' && item.contents) {
        item.contents.forEach((c) => {
          if (c.title.toLowerCase().includes(lowerQuery)) {
            results.push({
              item: c,
              parentFolderName: item.title,
            });
          }
        });
      }

      // Check root level scrap items
      if (item.type === 'SCRAP' && item.title.toLowerCase().includes(lowerQuery)) {
        results.push({ item });
      }
    });

    return results;
  },

  restoreItem: (item) =>
    set((state) => {
      // Remove deletedAt property when restoring
      const { deletedAt, ...restoredItem } = item;

      if (restoredItem.type === 'FOLDER') {
        return {
          data: [...state.data, { ...restoredItem, contents: restoredItem.contents ?? [] }],
        };
      }

      if (restoredItem.type === 'SCRAP') {
        if (restoredItem.parentFolderId) {
          // Restore to parent folder
          return {
            data: state.data.map((d) => {
              if (d.type === 'FOLDER' && d.id === restoredItem.parentFolderId) {
                return {
                  ...d,
                  contents: [...(d.contents ?? []), restoredItem],
                };
              }
              return d;
            }),
          };
        }

        // Restore to root
        return { data: [...state.data, restoredItem] };
      }

      return state;
    }),
}));

{
  /* TrashStore */
}

interface TrashStore {
  data: TrashItem[];

  addToTrash: (items: ScrapItem | ScrapItem[]) => void;
  restoreFromTrash: (ids: string | string[]) => void;
  deleteForever: (ids: string | string[]) => void;
}

export const useTrashStore = create<TrashStore>((set) => ({
  data: [],

  addToTrash: (items) =>
    set((state) => {
      const array = Array.isArray(items) ? items : [items];
      const trashItems: TrashItem[] = array.map((item) => ({
        ...item,
        deletedAt: Date.now(),
      }));

      return { data: [...state.data, ...trashItems] };
    }),

  restoreFromTrash: (ids) =>
    set((state) => {
      const restoreIds = Array.isArray(ids) ? ids : [ids];
      return {
        data: state.data.filter((item) => !restoreIds.includes(item.id)),
      };
    }),

  deleteForever: (ids) =>
    set((state) => {
      const deleteIds = Array.isArray(ids) ? ids : [ids];
      return {
        data: state.data.filter((item) => !deleteIds.includes(item.id)),
      };
    }),
}));

{
  /* SearchHistoryStore works recently data add, clear in SearchScren */
}

interface SearchHistoryStore {
  keywords: string[];

  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  clear: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryStore>((set) => ({
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
}));
