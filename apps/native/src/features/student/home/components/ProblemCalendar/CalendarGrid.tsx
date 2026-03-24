import { Text, View } from 'react-native';

import { AnimatedPressable } from '@components/common';

import { CELL_ROW_HEIGHT, WEEK_DAYS } from './constants';
import { type CalendarCell } from './types';
import CalendarDate from './CalendarDate';

const getWeekDayColor = (index: number) => {
  if (index === 5) return 'text-blue-500';
  if (index === 6) return 'text-red-500';
  return 'text-gray-700';
};

interface CalendarGridProps {
  cells: CalendarCell[];
  onSelectDate: (date: Date) => void;
}

const CalendarGrid = ({ cells, onSelectDate }: CalendarGridProps) => {
  return (
    <View className='flex flex-row flex-wrap gap-y-2 p-5'>
      {WEEK_DAYS.map((day, index) => (
        <Text
          key={day}
          className={`typo-body-1-medium mb-3 text-center ${getWeekDayColor(index)}`}
          style={{ width: `${100 / 7}%` }}>
          {day}
        </Text>
      ))}
      {cells.map((cell) => (
        <AnimatedPressable
          key={cell.key}
          style={{ height: CELL_ROW_HEIGHT }}
          className='items-center justify-center'
          containerStyle={{ width: `${100 / 7}%` }}
          disabled={cell.disabled}
          onPress={() => onSelectDate(cell.date)}>
          <CalendarDate
            date={cell.label}
            dayOfWeek={cell.date.getDay()}
            progress={cell.progress}
            isSelected={cell.isSelected}
            disabled={cell.disabled}
          />
        </AnimatedPressable>
      ))}
    </View>
  );
};

export default CalendarGrid;
