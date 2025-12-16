import { FlatList, View } from 'react-native';
import { Action, State } from '../utils/reducer';
import { ScrapCard, SearchResultCard, TrashCard } from './ScrapCard';
import { ScrapAddItem, ScrapReviewItem } from './ScrapHeadCard';
import { ScrapItem, TrashItem } from '@/types/test/types';
import { useGridLayout } from '../utils/gridLayout';

/**
 * ADD item type for ScrapGrid
 */
export type AddItem = { ADD: true };

/**
 * Union type for ScrapGrid data items
 */
export type ScrapGridItem = ScrapItem | AddItem;

/**
 * Adds placeholder items to fill the last row in grid layout
 */
const addPlaceholders = <T extends ScrapItem | TrashItem | AddItem>(
  data: T[],
  columns: number
): (T | { placeholder: true })[] => {
  const fullRows = Math.floor(data.length / columns);
  const totalNeeded = (fullRows + 1) * columns;
  const emptyCount = totalNeeded - data.length;

  return [...data, ...Array(emptyCount).fill({ placeholder: true })];
};

interface ScrapGridProps {
  data: ScrapGridItem[];
  reducerState: State;
  dispatch: React.Dispatch<Action>;
}
export const ScrapGrid = ({ data, reducerState, dispatch }: ScrapGridProps) => {
  const { numColumns, gap } = useGridLayout();
  const finalData = addPlaceholders(data, numColumns);

  return (
    <FlatList
      key={numColumns}
      data={finalData}
      numColumns={numColumns}
      keyExtractor={(item) =>
        // item may be a ScrapItem/TrashItem or a placeholder item
        'id' in item && item.id !== undefined ? String(item.id) : Math.random().toString()
      }
      contentContainerStyle={{ paddingBottom: 120 }}
      columnWrapperStyle={{ marginBottom: gap }}
      renderItem={({ item, index }) => {
        const isLastColumn = (index + 1) % numColumns === 0;

        const spacingStyle = {
          flex: 1,
          marginRight: isLastColumn ? 0 : gap,
        };

        // Check for placeholder first
        if ('placeholder' in item && item.placeholder) {
          return <View style={spacingStyle} />;
        }

        // Handle ADD item (check before type guard since it may not have standard structure)
        if ('ADD' in item && item.ADD === true) {
          return (
            <View style={spacingStyle}>
              <ScrapAddItem />
            </View>
          );
        }

        // Type guard: ensure item is ScrapItem
        if (!('id' in item) || !('type' in item)) {
          return <View style={spacingStyle} />;
        }

        const scrapItem = item as ScrapItem;

        // Handle REVIEW item
        if (scrapItem.id === 'REVIEW') {
          return (
            <View style={spacingStyle}>
              <ScrapReviewItem
                props={{
                  ...scrapItem,
                  timestamp: new Date(scrapItem.timestamp).toLocaleDateString('ko-KR'),
                }}
              />
            </View>
          );
        }

        // Handle regular scrap items
        // Convert ScrapItem to ScrapListItemProps format
        return (
          <View style={spacingStyle}>
            <ScrapCard
              {...scrapItem}
              timestamp={new Date(scrapItem.timestamp).toLocaleDateString('ko-KR')}
              reducerState={reducerState}
              onCheckPress={() => dispatch?.({ type: 'SELECTING_ITEM', id: scrapItem.id })}
            />
          </View>
        );
      }}
    />
  );
};

interface SearchScrapGridProps {
  data: Array<{ item: ScrapItem; parentFolderName?: string }>;
}
export const SearchScrapGrid = ({ data }: SearchScrapGridProps) => {
  const { numColumns, gap } = useGridLayout();
  const mappedData = data.map((item) => ({
    ...item.item,
    parentFolderName: item.parentFolderName,
  }));

  const finalData = addPlaceholders(mappedData, numColumns);

  return (
    <FlatList
      key={numColumns}
      data={finalData}
      numColumns={numColumns}
      keyExtractor={(item) =>
        'id' in item && item.id !== undefined ? String(item.id) : Math.random().toString()
      }
      contentContainerStyle={{ paddingBottom: 120 }}
      columnWrapperStyle={{ marginBottom: gap }}
      renderItem={({ item, index }) => {
        const isLastColumn = (index + 1) % numColumns === 0;

        const spacingStyle = {
          flex: 1,
          marginRight: isLastColumn ? 0 : gap,
        };

        if ('placeholder' in item && item.placeholder) {
          return <View style={spacingStyle} />;
        }

        // Type guard: ensure item has required properties
        if (!('id' in item) || !('type' in item)) {
          return <View style={spacingStyle} />;
        }

        const scrapItem = item as ScrapItem & { parentFolderName?: string };

        return (
          <View style={spacingStyle}>
            <SearchResultCard item={scrapItem} parentFolderName={scrapItem.parentFolderName} />
          </View>
        );
      }}
    />
  );
};

interface TrashScrapGridProps {
  data: TrashItem[];
  reducerState: State;
  dispatch: React.Dispatch<Action>;
}

export const TrashScrapGrid = ({ data, reducerState, dispatch }: TrashScrapGridProps) => {
  const { numColumns, gap } = useGridLayout();
  const finalData = addPlaceholders(data, numColumns);

  return (
    <FlatList
      key={numColumns}
      data={finalData}
      numColumns={numColumns}
      keyExtractor={(item) =>
        'id' in item && item.id !== undefined ? String(item.id) : Math.random().toString()
      }
      contentContainerStyle={{ paddingBottom: 120 }}
      columnWrapperStyle={{ marginBottom: gap }}
      renderItem={({ item, index }) => {
        const isLastColumn = (index + 1) % numColumns === 0;

        const spacingStyle = {
          flex: 1,
          marginRight: isLastColumn ? 0 : gap,
        };

        if ('placeholder' in item && item.placeholder) {
          return <View style={spacingStyle} />;
        }

        // Type guard: ensure item is TrashItem
        if (!('id' in item) || !('type' in item) || !('deletedAt' in item)) {
          return <View style={spacingStyle} />;
        }

        const trashItem = item as TrashItem;

        return (
          <View style={spacingStyle}>
            <TrashCard
              item={trashItem}
              reducerState={reducerState}
              onCheckPress={() => dispatch({ type: 'SELECTING_ITEM', id: trashItem.id })}
            />
          </View>
        );
      }}
    />
  );
};
