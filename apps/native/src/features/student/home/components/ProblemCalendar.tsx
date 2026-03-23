import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { type ChangeEvent, type ComponentType, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';

import {
  CalendarCompletedIcon,
  CalendarInProgressIcon,
  CalendarNotStartedIcon,
  CalendarUnavailableIcon,
} from '@components/system/icons';
import { AnimatedPressable } from '@components/common';
import { type components } from '@schema';

import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@theme/tokens';

type PublishResp = components['schemas']['PublishResp'];
type CalendarProgress = 'completed' | 'inprogress' | 'notstarted' | 'unavailable';

interface CalendarDateProps {
  date: number;
  dayOfWeek: number;
  progress: CalendarProgress;
  isSelected?: boolean;
  disabled?: boolean;
}

const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const CalendarProgressIcon: Record<CalendarProgress, ComponentType> = {
  completed: CalendarCompletedIcon,
  inprogress: CalendarInProgressIcon,
  notstarted: CalendarNotStartedIcon,
  unavailable: CalendarUnavailableIcon,
};

const publishProgressMap: Record<PublishResp['progress'], CalendarProgress> = {
  DONE: 'completed',
  DOING: 'inprogress',
  NONE: 'notstarted',
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface CalendarHeaderProps {
  label: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectMonth: () => void;
  onSelectToday: () => void;
}

const CalendarHeader = ({
  label,
  onPrevMonth,
  onNextMonth,
  onSelectMonth,
  onSelectToday,
}: CalendarHeaderProps) => (
  <View className='h-14 flex-row items-center border-b border-gray-400 px-3'>
    <View className='flex-1' />
    <View className='flex-row items-center gap-1'>
      <AnimatedPressable className='size-12 items-end justify-center p-1' onPress={onPrevMonth}>
        <ChevronLeft size={20} color={colors['gray-700']} />
      </AnimatedPressable>
      <AnimatedPressable className='flex-row items-center' onPress={onSelectMonth}>
        <Text className='typo-title-2-bold text-black'>{label}</Text>
      </AnimatedPressable>
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
      className={`h-[66px] w-[54px] flex-col items-center justify-center overflow-hidden rounded-xl ${isSelected ? 'border-primary-200 border' : ''} ${disabled ? 'opacity-30' : ''}`}>
      <View
        className={`h-[30px] w-full items-center justify-center ${isSelected ? 'bg-blue-200' : ''}`}>
        <Text
          className={`w-[30px] text-center ${isSelected ? 'typo-heading-2-bold' : 'typo-body-1-regular'} ${dateColor}`}>
          {date}
        </Text>
      </View>
      <View className='size-[36px] items-center justify-center rounded-full bg-white'>
        <Icon />
      </View>
    </View>
  );
};

const CalendarLegend = () => {
  return (
    <View className='flex flex-row items-center justify-end px-[30px]'>
      <CalendarCompletedIcon width={20} height={20} />
      <Text className='typo-label-medium mr-4 ml-1 text-gray-800'>풀이 완료</Text>
      <CalendarInProgressIcon width={20} height={20} />
      <Text className='typo-label-medium mr-4 ml-1 text-gray-800'>진행 중</Text>
      <CalendarNotStartedIcon width={20} height={20} />
      <Text className='typo-label-medium mr-4 ml-1 text-gray-800'>시작 전</Text>
      <CalendarUnavailableIcon width={20} height={20} />
      <Text className='typo-label-medium ml-1 text-gray-800'>미출제</Text>
    </View>
  );
};

interface CalendarCell {
  key: string;
  date: Date;
  label: number;
  progress: CalendarProgress;
  isSelected: boolean;
  disabled: boolean;
}

interface CalendarProps {
  cells: CalendarCell[];
  onSelectDate: (date: Date) => void;
}

const Calendar = ({ cells, onSelectDate }: CalendarProps) => {
  return (
    <View className='flex flex-row flex-wrap gap-y-2 p-5'>
      {WEEK_DAYS.map((day, index) => (
        <Text
          key={day}
          className={`typo-body-1-medium mb-3 text-center ${index === 5 ? 'text-blue-500' : index === 6 ? 'text-red-500' : 'text-gray-700'}`}
          style={{ width: `${100 / 7}%` }}>
          {day}
        </Text>
      ))}
      {cells.map((cell) => (
        <AnimatedPressable
          key={cell.key}
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

interface ProblemCalendarProps {
  selectedMonth: Date;
  selectedDate: Date;
  studyData?: PublishResp[];
  onChangeMonth: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  isModal?: boolean;
}

const ProblemCalendar = ({
  selectedMonth,
  selectedDate,
  studyData = [],
  onChangeMonth,
  onDateSelect,
  isModal = false,
}: ProblemCalendarProps) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  const progressByDate = useMemo(() => {
    return studyData.reduce<Record<string, CalendarProgress>>((acc, publish) => {
      acc[publish.publishAt] = publishProgressMap[publish.progress] ?? 'unavailable';
      return acc;
    }, {});
  }, [studyData]);

  const cells = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const monthIndex = selectedMonth.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Align Monday as the first column
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }).map((_, index) => {
      const cellDate = new Date(year, monthIndex, index - startOffset + 1);
      const isCurrentMonth = cellDate.getMonth() === monthIndex;
      const dateKey = formatDateKey(cellDate);
      const progress =
        isCurrentMonth && progressByDate[dateKey] ? progressByDate[dateKey] : 'unavailable';
      const isSelected =
        selectedDate.getFullYear() === cellDate.getFullYear() &&
        selectedDate.getMonth() === cellDate.getMonth() &&
        selectedDate.getDate() === cellDate.getDate();

      return {
        key: `${cellDate.toISOString()}-${index}`,
        date: cellDate,
        label: cellDate.getDate(),
        progress,
        isSelected,
        disabled: !isCurrentMonth,
      };
    });
  }, [progressByDate, selectedDate, selectedMonth]);

  const handleSelectDate = (date: Date) => {
    onDateSelect(date);
  };

  const handleSelectToday = () => {
    applyDateSelection(new Date());
  };

  const handlePrevMonth = () => {
    const prev = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    onChangeMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    onChangeMonth(next);
  };

  const pickerValue = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    selectedDate.getDate()
  );
  const [webPickerDate, setWebPickerDate] = useState(pickerValue);

  useEffect(() => {
    setWebPickerDate(pickerValue);
  }, [pickerValue]);

  const applyDateSelection = (date: Date) => {
    const maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const safeDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      Math.min(date.getDate(), maxDay)
    );
    const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    onChangeMonth(nextMonth);
    onDateSelect(safeDate);
  };

  const handleMonthPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed' || !date) {
      if (isIOS) {
        setPickerVisible(false);
      }
      return;
    }

    applyDateSelection(date);

    if (isAndroid) {
      setPickerVisible(false);
    }
  };

  const handleOpenMonthPicker = () => {
    if (isAndroid) {
      DateTimePickerAndroid.open({
        mode: 'date',
        display: 'calendar',
        value: pickerValue,
        onChange: handleMonthPickerChange,
      });
      return;
    }
    setWebPickerDate(pickerValue);
    setPickerVisible(true);
  };

  const handleClosePicker = () => {
    setPickerVisible(false);
    setWebPickerDate(pickerValue);
  };

  const handleConfirmWebPicker = () => {
    applyDateSelection(webPickerDate);
    handleClosePicker();
  };

  const handleWebInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) {
      return;
    }
    const [yearString, monthString] = value.split('-');
    const year = Number(yearString);
    const monthIndex = Number(monthString) - 1;

    if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0) {
      return;
    }

    const baseDay = webPickerDate.getDate();
    const maxDay = new Date(year, monthIndex + 1, 0).getDate();
    const nextDate = new Date(year, monthIndex, Math.min(baseDay, maxDay));

    setWebPickerDate(nextDate);
  };

  const monthLabel = `${selectedMonth.getFullYear()}년 ${selectedMonth.getMonth() + 1}월`;

  const containerClassName = isModal ? '' : 'rounded-[14px] bg-white md:flex-1 md:basis-1/2';

  return (
    <View className={containerClassName}>
      <CalendarHeader
        label={monthLabel}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onSelectMonth={handleOpenMonthPicker}
        onSelectToday={handleSelectToday}
      />
      <Calendar cells={cells} onSelectDate={handleSelectDate} />
      <CalendarLegend />
      {(isIOS || isWeb) && isPickerVisible && (
        <Modal
          transparent
          animationType='fade'
          visible={isPickerVisible}
          onRequestClose={handleClosePicker}>
          <View className='flex-1 justify-end bg-[#0B112466]'>
            <Pressable className='flex-1' onPress={handleClosePicker} />
            <View className='mx-[20px] mb-[32px] rounded-[16px] bg-white p-[20px]'>
              <View className='h-fit w-full items-center justify-center'>
                {isIOS ? (
                  <DateTimePicker
                    mode='date'
                    display='spinner'
                    value={pickerValue}
                    onChange={handleMonthPickerChange}
                    textColor='black'
                  />
                ) : (
                  <input
                    type='month'
                    className='typo-body-1-regular w-full rounded-[8px] border border-gray-200 px-[12px] py-[10px] text-gray-900 outline-none'
                    value={`${webPickerDate.getFullYear()}-${String(webPickerDate.getMonth() + 1).padStart(2, '0')}`}
                    onChange={handleWebInputChange}
                  />
                )}
              </View>
              <AnimatedPressable
                className='bg-primary-500 mt-5 h-[50px] items-center justify-center rounded-lg'
                onPress={isWeb ? handleConfirmWebPicker : handleClosePicker}>
                <Text className='typo-body-1-medium text-center text-white'>완료</Text>
              </AnimatedPressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ProblemCalendar;
