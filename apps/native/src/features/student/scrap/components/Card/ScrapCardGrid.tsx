import { Dimensions, FlatList, View } from 'react-native';
import { Action, State } from '../../utils/reducer';
import { ScrapCard } from './cards/ScrapCard';
import { SearchResultCard } from './cards/SearchResultCard';
import { TrashCard } from './cards/TrashCard';
import { ScrapAddCard, ScrapAllCard } from './cards/ScrapHeadCard';
import { ScrapItem, TrashItem } from '@/features/student/scrap/utils/types';
import { useGridLayout } from '../../utils/layout/gridLayout';
import { useState } from 'react';

/**
 * ADD, ALL item type for ScrapGrid
 */
export type AddItem = { ADD: true };
export type AllItem = { ALL: true };

/**
 * Union type for ScrapGrid data items
 */
export type ScrapGridItem = ScrapItem | AddItem | AllItem;

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
  const [containerWidth, setContainerWidth] = useState(0);
  const { numColumns, gap, itemWidth } = useGridLayout(containerWidth);
  const finalData = addPlaceholders(data as ScrapItem[], numColumns);

  return (
    <FlatList
      key={numColumns}
      scrollEnabled={false}
      data={finalData}
      numColumns={numColumns}
      onLayout={(e) => {
        const width = Math.floor(e.nativeEvent.layout.width);
        if (width > 0 && width !== containerWidth) {
          setContainerWidth(width);
        }
      }}
      keyExtractor={(item, index) => {
        if ('placeholder' in item && item.placeholder) {
          return `placeholder-${index}`;
        }

        if ('ADD' in item && item.ADD === true) {
          return 'add-item';
        }

        if ('ALL' in item && item.ALL === true) {
          return 'all-item';
        }

        if ('id' in item && 'type' in item) {
          return `${item.type}-${item.id}`;
        }

        return `fallback-${index}`;
      }}
      contentContainerStyle={{ paddingBottom: 120 }}
      columnWrapperStyle={{ marginBottom: gap * 2 + 5 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      initialNumToRender={10}
      renderItem={({ item, index }) => {
        const isLastColumn = (index + 1) % numColumns === 0;

        const spacingStyle = {
          width: itemWidth,
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
              <ScrapAddCard reducerState={reducerState} />
            </View>
          );
        }

        if ('ALL' in item && item.ALL === true) {
          return (
            <View style={spacingStyle}>
              <ScrapAllCard
                reducerState={reducerState}
                onCheckPress={() =>
                  dispatch?.({
                    type: 'SELECTING_ITEM',
                    id: undefined,
                    itemType: 'FOLDER',
                  })
                }
              />
            </View>
          );
        }

        // Type guard: ensure item is ScrapItem
        if (!('id' in item) || !('type' in item)) {
          return <View style={spacingStyle} />;
        }

        const scrapItem = item as ScrapItem;

        return (
          <View style={spacingStyle}>
            <ScrapCard
              {...scrapItem}
              reducerState={reducerState}
              onCheckPress={() =>
                dispatch?.({
                  type: 'SELECTING_ITEM',
                  id: scrapItem.id,
                  itemType: scrapItem.type,
                })
              }
            />
          </View>
        );
      }}
    />
  );
};

interface SearchScrapGridProps {
  data: ScrapItem[];
  searchQuery?: string;
}

export const SearchScrapGrid = ({ data, searchQuery }: SearchScrapGridProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const { numColumns, gap, itemWidth } = useGridLayout(containerWidth);
  const finalData = addPlaceholders(data, numColumns);

  return (
    <FlatList
      key={numColumns}
      scrollEnabled={false}
      data={finalData}
      numColumns={numColumns}
      onLayout={(e) => {
        const width = Math.floor(e.nativeEvent.layout.width);
        if (width > 0 && width !== containerWidth) {
          setContainerWidth(width);
        }
      }}
      keyExtractor={(item, index) => {
        if ('placeholder' in item && item.placeholder) {
          return `placeholder-${index}`;
        }

        if ('ADD' in item && item.ADD === true) {
          return 'add-item';
        }

        if ('id' in item && 'type' in item) {
          return `${item.type}-${item.id}`;
        }

        return `fallback-${index}`;
      }}
      columnWrapperStyle={{ marginBottom: gap * 2 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      initialNumToRender={10}
      renderItem={({ item, index }) => {
        const isLastColumn = (index + 1) % numColumns === 0;

        const spacingStyle = {
          width: itemWidth,
          marginRight: isLastColumn ? 0 : gap,
        };

        if ('placeholder' in item && item.placeholder) {
          return <View style={spacingStyle} />;
        }

        if (!('id' in item) || !('type' in item)) {
          return <View style={spacingStyle} />;
        }

        const scrapItem = item as ScrapItem;

        // ScrapItem을 ScrapListItemProps로 변환
        const baseProps = {
          id: scrapItem.id,
          name: scrapItem.name,
          createdAt: scrapItem.createdAt,
          updatedAt: scrapItem.updatedAt,
          thumbnailUrl: scrapItem.thumbnailUrl,
        };

        const searchCardProps =
          scrapItem.type === 'FOLDER'
            ? {
                ...baseProps,
                type: 'FOLDER' as const,
                scrapCount: ('scrapCount' in scrapItem ? scrapItem.scrapCount : undefined) as
                  | number
                  | undefined,
                top2ScrapThumbnail: ('top2ScrapThumbnail' in scrapItem
                  ? scrapItem.top2ScrapThumbnail
                  : undefined) as string[] | undefined,
              }
            : {
                ...baseProps,
                type: 'SCRAP' as const,
                folderId: scrapItem.folderId,
              };

        return (
          <View style={spacingStyle}>
            <SearchResultCard {...searchCardProps} searchQuery={searchQuery} />
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
  const [containerWidth, setContainerWidth] = useState(0);
  const { numColumns, gap, itemWidth } = useGridLayout(containerWidth);
  const finalData = addPlaceholders(data, numColumns);

  return (
    <FlatList
      key={numColumns}
      data={finalData}
      numColumns={numColumns}
      onLayout={(e) => {
        const width = Math.floor(e.nativeEvent.layout.width);
        if (width > 0 && width !== containerWidth) {
          setContainerWidth(width);
        }
      }}
      keyExtractor={(item, index) => {
        if ('placeholder' in item && item.placeholder) {
          return `placeholder-${index}`;
        }

        if ('ADD' in item && item.ADD === true) {
          return 'add-item';
        }

        if ('id' in item && 'type' in item) {
          return `${item.type}-${item.id}`;
        }

        return `fallback-${index}`;
      }}
      contentContainerStyle={{ paddingBottom: 120 }}
      columnWrapperStyle={{ marginBottom: gap * 2 }}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={10}
      initialNumToRender={10}
      renderItem={({ item, index }) => {
        const isLastColumn = (index + 1) % numColumns === 0;

        const spacingStyle = {
          width: itemWidth,
          marginRight: isLastColumn ? 0 : gap,
        };

        // Check for placeholder first
        if ('placeholder' in item && item.placeholder) {
          return <View style={spacingStyle} />;
        }

        // Type guard: ensure item is TrashItem
        if (!('id' in item) || !('type' in item) || !('deletedAt' in item)) {
          return <View style={spacingStyle} />;
        }

        const trashItem = item as TrashItem;

        // TrashItem을 TrashListItemProps로 변환
        const baseProps = {
          id: trashItem.id,
          name: trashItem.name,
          createdAt: trashItem.createdAt,
          updatedAt: ('updatedAt' in trashItem ? trashItem.updatedAt : undefined) as
            | string
            | undefined,
          thumbnailUrl: trashItem.thumbnailUrl,
          daysUntilPermanentDelete: trashItem.daysUntilPermanentDelete,
          reducerState,
          onCheckPress: () =>
            dispatch({ type: 'SELECTING_ITEM', id: trashItem.id, itemType: trashItem.type }),
        };

        const trashCardProps =
          trashItem.type === 'FOLDER'
            ? {
                ...baseProps,
                type: 'FOLDER' as const,
                top2ScrapThumbnail: trashItem.top2ScrapThumbnail,
                itemCount: trashItem.itemCount,
              }
            : {
                ...baseProps,
                type: 'SCRAP' as const,
                folderId: undefined,
              };

        return (
          <View style={spacingStyle}>
            <TrashCard {...trashCardProps} />
          </View>
        );
      }}
    />
  );
};
