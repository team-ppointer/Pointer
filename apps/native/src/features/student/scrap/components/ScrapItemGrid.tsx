import { FlatList, useWindowDimensions, View } from 'react-native';
import { Action, State } from '../utils/reducer';
import ScrapItem from './ScrapItem';

export type DummyItem =
  | { type: 'Folder'; id: string; title: string; amount: number }
  | { type: 'Scrap'; id: string; title: string; timestamp: number };

interface ScrapGridProps {
  data: DummyItem[];
  state: State;
  dispatch: React.Dispatch<Action>;
}

const addPlaceholders = (data: DummyItem[], columns: number) => {
  const fullRows = Math.floor(data.length / columns);
  const totalNeeded = (fullRows + 1) * columns;
  const emptyCount = totalNeeded - data.length;

  return [...data, ...Array(emptyCount).fill({ placeholder: true })];
};
const ScrapGrid = ({ data, state, dispatch }: ScrapGridProps) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > 1024 && width > height;

  let numColumns = isLandscape ? 6 : 4;
  const gap = isLandscape ? 22 : 34;

  const totalGap = gap * (numColumns - 1);
  const padding = isLandscape ? 256 : 120;
  const itemWidth = (width - totalGap - padding) / numColumns;

  if (itemWidth < 136) {
    numColumns = isLandscape ? 5 : 4;
  }

  const finalData = addPlaceholders(data, numColumns);

  return (
    <FlatList
      key={numColumns}
      data={finalData}
      numColumns={numColumns}
      keyExtractor={(item) => item.id ?? Math.random().toString()}
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

        return (
          <View style={spacingStyle}>
            <ScrapItem
              {...item}
              ruducerState={state}
              onCheckPress={() => dispatch({ type: 'SELECTING_ITEM', id: item.id })}
            />
          </View>
        );
      }}
    />
  );
};

export default ScrapGrid;
