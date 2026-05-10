import { Text, View } from 'react-native';

import { AnimatedPressable } from '@components/common';
import { useIsTablet } from '@hooks/useIsTablet';
import { colors } from '@theme/tokens';

type Props = {
  selected: number[];
  onToggle: (n: number) => void;
};

const TOTAL_CELLS = 30;

const buildTabletNumbers = () => {
  const cols = 6;
  const rows = 5;
  const grid: number[][] = [];
  for (let row = 0; row < rows; row++) {
    const rowCells: number[] = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push(col * rows + row + 1);
    }
    grid.push(rowCells);
  }
  return grid;
};

const buildPhoneNumbers = () => {
  const cols = 5;
  const rows = 6;
  const grid: number[][] = [];
  for (let row = 0; row < rows; row++) {
    const rowCells: number[] = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push(row * cols + col + 1);
    }
    grid.push(rowCells);
  }
  return grid;
};

const IncorrectGrid = ({ selected, onToggle }: Props) => {
  const isTablet = useIsTablet();
  const grid = isTablet ? buildTabletNumbers() : buildPhoneNumbers();
  const selectedSet = new Set(selected);

  return (
    <View className='gap-[10px]'>
      {grid.map((row, rowIndex) => (
        <View key={`incorrect-row-${rowIndex}`} className='flex-row gap-[10px]'>
          {row.map((n) => {
            const isSelected = selectedSet.has(n);
            return (
              <AnimatedPressable
                key={n}
                accessibilityRole='button'
                accessibilityLabel={`${n}번`}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onToggle(n)}
                className='h-[44px] flex-1 items-center justify-center rounded-[8px]'
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? colors['primary-500'] : colors['gray-300'],
                  backgroundColor: isSelected ? colors['primary-100'] : '#FFFFFF',
                }}>
                <Text
                  className='typo-body-1-medium'
                  style={{
                    color: isSelected ? colors['primary-700'] : colors['gray-800'],
                  }}>
                  {n}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export { TOTAL_CELLS };
export default IncorrectGrid;
