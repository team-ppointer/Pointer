import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { AnimatedPressable } from '@components/common';
import { useIsTablet } from '@hooks/useIsTablet';
import { colors } from '@theme/tokens';

type Props = {
  selected: number[];
  onToggle: (n: number) => void;
};

const GROUPS: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
];

type CellProps = {
  n: number;
  isSelected: boolean;
  onToggle: (n: number) => void;
  height: number;
};

const Cell = ({ n, isSelected, onToggle, height }: CellProps) => (
  <AnimatedPressable
    accessibilityRole='button'
    accessibilityLabel={`${n}번`}
    accessibilityState={{ selected: isSelected }}
    onPress={() => onToggle(n)}
    containerStyle={{ flex: 1 }}
    className='items-center justify-center rounded-[8px]'
    style={{
      height,
      borderWidth: 1,
      borderColor: isSelected ? colors['primary-500'] : colors['gray-300'],
      backgroundColor: isSelected ? colors['primary-100'] : '#FFFFFF',
    }}>
    <Text className='typo-body-1-medium text-black'>{n}</Text>
  </AnimatedPressable>
);

type GroupProps = {
  group: number[];
  selectedSet: Set<number>;
  onToggle: (n: number) => void;
};

const TabletGroup = ({ group, selectedSet, onToggle }: GroupProps) => {
  const columns = [group.slice(0, 5), group.slice(5, 10)];
  return (
    <View className='flex-1 flex-row gap-[10px]'>
      {columns.map((column, ci) => (
        <View key={ci} className='flex-1 gap-[10px]'>
          {column.map((n) => (
            <Cell key={n} n={n} isSelected={selectedSet.has(n)} onToggle={onToggle} height={38} />
          ))}
        </View>
      ))}
    </View>
  );
};

const MobileGroup = ({ group, selectedSet, onToggle }: GroupProps) => {
  const rows = [group.slice(0, 5), group.slice(5, 10)];
  return (
    <View className='gap-[8px]'>
      {rows.map((row, ri) => (
        <View key={ri} className='flex-row gap-[8px]'>
          {row.map((n) => (
            <Cell key={n} n={n} isSelected={selectedSet.has(n)} onToggle={onToggle} height={40} />
          ))}
        </View>
      ))}
    </View>
  );
};

const IncorrectGrid = ({ selected, onToggle }: Props) => {
  const isTablet = useIsTablet();
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  if (isTablet) {
    return (
      <View className='flex-row gap-[40px]'>
        {GROUPS.map((group, gi) => (
          <TabletGroup key={gi} group={group} selectedSet={selectedSet} onToggle={onToggle} />
        ))}
      </View>
    );
  }

  return (
    <View className='gap-[20px]'>
      {GROUPS.map((group, gi) => (
        <MobileGroup key={gi} group={group} selectedSet={selectedSet} onToggle={onToggle} />
      ))}
    </View>
  );
};

export default IncorrectGrid;
