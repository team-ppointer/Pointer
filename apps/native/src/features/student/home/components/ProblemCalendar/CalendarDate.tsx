import { Text, View } from 'react-native';

import { shadow } from '@theme/tokens';

import {
  CELL_DATE_HEIGHT,
  CELL_HEIGHT,
  CELL_ICON_SIZE,
  CELL_WIDTH,
  CalendarProgressIcon,
} from './constants';
import { type CalendarDateProps } from './types';

const getDayOfWeekColor = (dayOfWeek: number, isSelected: boolean) => {
  if (isSelected) return 'text-primary-600';
  if (dayOfWeek === 6) return 'text-blue-500'; // Saturday
  if (dayOfWeek === 0) return 'text-red-500'; // Sunday
  return 'text-gray-800';
};

const CalendarDate = ({
  date,
  dayOfWeek,
  progress,
  isSelected = false,
  disabled = false,
}: CalendarDateProps) => {
  const Icon = CalendarProgressIcon[progress];
  const dateColor = getDayOfWeekColor(dayOfWeek, isSelected);
  return (
    <View
      style={isSelected ? shadow[300] : undefined}
      className={`rounded-xl ${isSelected ? 'border-primary-200 border' : ''} ${disabled ? 'opacity-30' : ''}`}>
      <View
        style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
        className='flex-col items-center justify-center overflow-hidden rounded-xl'>
        <View
          style={{ height: CELL_DATE_HEIGHT }}
          className={`w-full items-center justify-center ${isSelected ? 'bg-blue-200' : ''}`}>
          <Text
            className={`text-center ${isSelected ? 'typo-heading-2-bold' : 'typo-body-1-regular'} ${dateColor}`}>
            {date}
          </Text>
        </View>
        <View
          style={{ width: CELL_WIDTH, height: CELL_ICON_SIZE }}
          className='items-center justify-center bg-white'>
          <Icon />
        </View>
      </View>
    </View>
  );
};

export default CalendarDate;
