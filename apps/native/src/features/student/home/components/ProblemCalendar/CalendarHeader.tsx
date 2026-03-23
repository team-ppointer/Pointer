import { Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { AnimatedPressable } from '@components/common';
import { colors } from '@theme/tokens';

import MonthPickerPopover from './MonthPickerPopover';

interface CalendarHeaderProps {
  label: string;
  pickerValue: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPickDate: (date: Date) => void;
  onSelectToday: () => void;
}

const CalendarHeader = ({
  label,
  pickerValue,
  onPrevMonth,
  onNextMonth,
  onPickDate,
  onSelectToday,
}: CalendarHeaderProps) => (
  <View className='h-14 flex-row items-center border-b border-gray-400 px-3'>
    <View className='flex-1' />
    <View className='flex-row items-center gap-1'>
      <AnimatedPressable className='size-12 items-end justify-center p-1' onPress={onPrevMonth}>
        <ChevronLeft size={20} color={colors['gray-700']} />
      </AnimatedPressable>
      <MonthPickerPopover value={pickerValue} onSelect={onPickDate}>
        <View className='flex-row items-center'>
          <Text className='typo-title-2-bold text-black'>{label}</Text>
        </View>
      </MonthPickerPopover>
      <AnimatedPressable className='size-12 items-start justify-center p-1' onPress={onNextMonth}>
        <ChevronRight size={20} color={colors['gray-700']} />
      </AnimatedPressable>
    </View>
    <View className='flex-1 items-end'>
      <AnimatedPressable
        className='h-9 items-center justify-center rounded-lg bg-gray-300 px-3'
        onPress={onSelectToday}>
        <Text className='typo-label-medium text-gray-700'>오늘</Text>
      </AnimatedPressable>
    </View>
  </View>
);

export default CalendarHeader;
