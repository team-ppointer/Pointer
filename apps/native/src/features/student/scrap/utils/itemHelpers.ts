import { ScrapItem } from '@/types/test/types';

/**
 * Finds an item in the scrap data structure.
 * @param data - Array of scrap items
 * @param id - ID of the item to find
 * @param parentFolderId - Optional parent folder ID for nested items
 * @returns The found item or null if not found
 */
export const findItem = (
  data: ScrapItem[],
  id: string,
  parentFolderId?: string
): ScrapItem | null => {
  if (parentFolderId) {
    const folder = data.find((i) => i.id === parentFolderId && i.type === 'FOLDER');
    if (folder?.type === 'FOLDER') {
      return folder.contents?.find((c) => c.id === id) ?? null;
    }
    return null;
  }
  return data.find((i) => i.id === id) ?? null;
};

/**
 * Recursively deletes items from the scrap data structure.
 * @param items - Array of items to filter
 * @param idsToDelete - Array of IDs to delete
 * @returns Filtered array with deleted items removed
 */
export const deleteItemsRecursive = (items: ScrapItem[], idsToDelete: string[]): ScrapItem[] => {
  return items
    .filter((item) => !idsToDelete.includes(item.id))
    .map((item) => {
      if (item.type === 'FOLDER' && item.contents) {
        return {
          ...item,
          contents: deleteItemsRecursive(item.contents, idsToDelete),
        };
      }
      return item;
    });
};
