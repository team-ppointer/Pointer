import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { type ComponentType, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';

import {
  CalendarCompletedIcon,
  CalendarInProgressIcon,
  CalendarNotStartedIcon,
  CalendarUnavailableIcon,
  ChevronDownFilledIcon,
} from '@components/system/icons';
import { components } from '@schema';

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
  <View className='flex-row items-center'>
    <Pressable className='flex-row items-center' onPress={onSelectMonth}>
      <Text className='text-20b mr-[4px] text-gray-900'>{label}</Text>
      <View className='p-[4px]'>
        <ChevronDownFilledIcon />
      </View>
    </Pressable>
    <Pressable className='ml-auto' onPress={onSelectToday}>
      <Text className='text-16r text-gray-900'>오늘</Text>
    </Pressable>
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
      className={`flex-col items-center justify-center gap-[2px] rounded-full p-[4px] ${isSelected ? 'bg-primary-200' : 'bg-white'} ${disabled ? 'opacity-30' : ''}`}>
      <Text className={`text-16m ${isSelected ? 'text-[#3952D1]' : 'text-[#25252E]'}`}>{date}</Text>
      <View className='rounded-full bg-white p-[4px]'>
        <Icon />
      </View>
    </View>
  );
};

const CalendarLegend = () => {
  return (
    <View className='flex flex-row items-center justify-end'>
      <CalendarCompletedIcon width={20} height={20} />
      <Text className='text-12r ml-[4px] mr-[12px] text-gray-900'>풀이 완료</Text>
      <CalendarInProgressIcon width={20} height={20} />
      <Text className='text-12r ml-[4px] mr-[12px] text-gray-900'>진행 중</Text>
      <CalendarNotStartedIcon width={20} height={20} />
      <Text className='text-12r ml-[4px] mr-[12px] text-gray-900'>시작 전</Text>
      <CalendarUnavailableIcon width={20} height={20} />
      <Text className='text-12r ml-[4px] text-gray-900'>미출제</Text>
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
    <View className='flex flex-row flex-wrap gap-y-[8px]'>
      {WEEK_DAYS.map((day) => (
        <Text
          key={day}
          className='text-16r text-center text-gray-600'
          style={{ width: `${100 / 7}%` }}>
          {day}
        </Text>
      ))}
      {cells.map((cell) => (
        <Pressable
          key={cell.key}
          className='items-center justify-center'
          style={{ width: `${100 / 7}%` }}
          disabled={cell.disabled}
          onPress={() => onSelectDate(cell.date)}>
          <CalendarDate
            date={cell.label}
            progress={cell.progress}
            isSelected={cell.isSelected}
            disabled={cell.disabled}
          />
        </Pressable>
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
}

const ProblemCalendar = ({
  selectedMonth,
  selectedDate,
  studyData = [],
  onChangeMonth,
  onDateSelect,
}: ProblemCalendarProps) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

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
    const today = new Date();
    const monthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    onChangeMonth(monthDate);
    onDateSelect(today);
  };

  const pickerValue = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    selectedDate.getDate()
  );

  const handleMonthPickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed' || !date) {
      if (Platform.OS === 'ios') {
        setPickerVisible(false);
      }
      return;
    }

    const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    onChangeMonth(nextMonth);
    onDateSelect(nextDate);

    if (Platform.OS === 'android') {
      setPickerVisible(false);
    }
  };

  const handleOpenMonthPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        display: 'calendar',
        value: pickerValue,
        onChange: handleMonthPickerChange,
      });
      return;
    }
    setPickerVisible(true);
  };

  const handleClosePicker = () => {
    setPickerVisible(false);
  };

  const monthLabel = `${selectedMonth.getFullYear()}년 ${selectedMonth.getMonth() + 1}월`;

  return (
    <View className='flex-1 basis-1/2 gap-[20px] rounded-[12px] bg-white p-[20px] shadow-[0px_4px_4px_-4px_rgba(12,12,13,0.05),_0px_16px_32px_-4px_rgba(12,12,13,0.10)]'>
      <CalendarHeader
        label={monthLabel}
        onSelectMonth={handleOpenMonthPicker}
        onSelectToday={handleSelectToday}
      />
      <Calendar cells={cells} onSelectDate={handleSelectDate} />
      <CalendarLegend />
      {Platform.OS === 'ios' && isPickerVisible && (
        <Modal
          transparent
          animationType='fade'
          visible={isPickerVisible}
          onRequestClose={handleClosePicker}>
          <View className='flex-1 justify-end bg-[#0B112466]'>
            <Pressable className='flex-1' onPress={handleClosePicker} />
            <View className='mx-[20px] mb-[32px] rounded-[16px] bg-white p-[20px]'>
              <View className='h-fit w-fit items-center justify-center'>
                <DateTimePicker
                  mode='date'
                  display='spinner'
                  value={pickerValue}
                  onChange={handleMonthPickerChange}
                />
              </View>
              <Pressable
                className='bg-primary-500 mt-[12px] rounded-[8px] px-[16px] py-[10px]'
                onPress={handleClosePicker}>
                <Text className='text-14m text-center text-white'>완료</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ProblemCalendar;
