import { TrashItem, ScrapItem } from '@/types/test/types';

export type SortKey = 'TYPE' | 'TITLE' | 'DATE';
export type SortOrder = 'ASC' | 'DESC';

/**
 * Sorts scrap items by the specified key and order.
 * REVIEW items are always placed at the beginning.
 */
export const sortScrapData = <T extends ScrapItem | TrashItem>(
  list: T[],
  key: SortKey,
  order: SortOrder
): T[] => {
  const mul = order === 'ASC' ? 1 : -1;

  // Separate REVIEW item (always shown first)
  const reviewItem = list.find((item) => item.id === 'REVIEW');
  const sortable = list.filter((item) => item.id !== 'REVIEW');

  const sorted = [...sortable].sort((a, b) => {
    switch (key) {
      case 'TYPE':
        // Sort by type first (FOLDER before SCRAP)
        if (a.type !== b.type) {
          return (a.type === 'FOLDER' ? -1 : 1) * mul;
        }
        // Same type: sort by timestamp
        return (a.timestamp - b.timestamp) * mul;

      case 'TITLE':
        // Sort by title using Korean locale
        return a.title.localeCompare(b.title, 'ko', { numeric: true }) * mul;

      case 'DATE':
        // Sort by timestamp
        return (a.timestamp - b.timestamp) * mul;

      default:
        return 0;
    }
  });

  // REVIEW item always comes first
  return reviewItem ? ([reviewItem, ...sorted] as T[]) : sorted;
};
