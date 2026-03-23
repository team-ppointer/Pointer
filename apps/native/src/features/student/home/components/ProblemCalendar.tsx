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
  ChevronDownFilledIcon,
} from '@components/system/icons';
import { AnimatedPressable } from '@components/common';
import { type components } from '@schema';

type PublishResp = components['schemas']['PublishResp'];
type CalendarProgress = 'completed' | 'inprogress' | 'notstarted' | 'unavailable';

interface CalendarDateProps {
  date: number;
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
  onSelectMonth: () => void;
  onSelectToday: () => void;
}

const CalendarHeader = ({ label, onSelectMonth, onSelectToday }: CalendarHeaderProps) => (
  <View className='flex-row items-center justify-between border-b border-gray-400 px-[20px] py-[8px]'>
    <AnimatedPressable className='flex-row items-center' onPress={onSelectMonth}>
      <Text className='text-20b mr-[4px] text-gray-900'>{label}</Text>
      <View className='p-[4px]'>
        <ChevronDownFilledIcon />
      </View>
    </AnimatedPressable>
    <AnimatedPressable
      className='ml-auto h-[32px] items-center justify-center rounded-[8px] bg-gray-300 px-[8px]'
      onPress={onSelectToday}>
      <Text className='text-14m text-gray-700'>오늘</Text>
    </AnimatedPressable>
  </View>
);

const CalendarDate = ({
  date,
  progress,
  isSelected = false,
  disabled = false,
}: CalendarDateProps) => {
  const Icon = CalendarProgressIcon[progress];
  return (
    <View
      className={`flex-col items-center justify-center overflow-hidden rounded-[12px] ${isSelected ? 'border-primary-200 border' : ''} ${disabled ? 'opacity-30' : ''}`}>
      <View className={`px-[12px] py-[3px] ${isSelected ? 'bg-blue-200' : ''}`}>
        <Text
          className={`w-[30px] text-center ${isSelected ? 'text-16b text-primary-600' : 'text-15r text-gray-800'}`}>
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
      <Text className='text-14m ml-[4px] mr-[16px] text-gray-900'>풀이 완료</Text>
      <CalendarInProgressIcon width={20} height={20} />
      <Text className='text-14m ml-[4px] mr-[16px] text-gray-900'>진행 중</Text>
      <CalendarNotStartedIcon width={20} height={20} />
      <Text className='text-14m ml-[4px] mr-[16px] text-gray-900'>시작 전</Text>
      <CalendarUnavailableIcon width={20} height={20} />
      <Text className='text-14m ml-[4px] text-gray-900'>미출제</Text>
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
    <View className='flex flex-row flex-wrap gap-y-[8px] p-[20px]'>
      {WEEK_DAYS.map((day) => (
        <Text
          key={day}
          className='text-16r mb-[8px] text-center text-gray-600'
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

  const containerClassName = isModal
    ? ''
    : 'rounded-[12px] bg-white p-[20px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)] md:flex-1 md:basis-1/2';

  return (
    <View className={containerClassName}>
      <CalendarHeader
        label={monthLabel}
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
                    className='text-16r w-full rounded-[8px] border border-gray-200 px-[12px] py-[10px] text-gray-900 outline-none'
                    value={`${webPickerDate.getFullYear()}-${String(webPickerDate.getMonth() + 1).padStart(2, '0')}`}
                    onChange={handleWebInputChange}
                  />
                )}
              </View>
              <AnimatedPressable
                className='bg-primary-500 mt-[12px] rounded-[8px] px-[16px] py-[10px]'
                onPress={isWeb ? handleConfirmWebPicker : handleClosePicker}>
                <Text className='text-14m text-center text-white'>완료</Text>
              </AnimatedPressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ProblemCalendar;
