import { DummyItem } from '../components/ScrapItemGrid';

export type SortKey = 'TYPE' | 'TITLE' | 'DATE';
export type SortOrder = 'ASC' | 'DESC';

export const sortScrapData = (list: DummyItem[], key: SortKey, order: SortOrder) => {
  const mul = order === 'ASC' ? 1 : -1;

  const reviewItem = list.find((item) => item.id === 'REVIEW');
  const sortable = list.filter((item) => item.id !== 'REVIEW');

  const sorted = [...sortable];

  switch (key) {
    case 'TYPE':
      sorted.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'Folder' ? -1 * mul : 1 * mul;

        if (a.type === 'Folder') return (b.timestamp - a.timestamp) * mul;
        if (a.type === 'Scrap') return (a.timestamp - b.timestamp) * mul;

        return 0;
      });
      break;

    case 'TITLE':
      sorted.sort((a, b) => a.title.localeCompare(b.title) * mul);
      break;

    case 'DATE':
      sorted.sort((a, b) => (a.timestamp - b.timestamp) * mul);
      break;
  }

  if (reviewItem) {
    return [reviewItem, ...sorted];
  }
  return sorted;
};
