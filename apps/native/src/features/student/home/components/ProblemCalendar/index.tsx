import { View } from 'react-native';

import { clampDayToMonth } from '@utils/date';

import { useCalendarData } from '../../hooks/useCalendarData';

import { type PublishResp } from './types';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import CalendarLegend from './CalendarLegend';

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
  const cells = useCalendarData({ selectedMonth, selectedDate, studyData });

  const applyDateSelection = (date: Date) => {
    const safeDate = clampDayToMonth(date.getDate(), date.getFullYear(), date.getMonth());
    onChangeMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    onDateSelect(safeDate);
  };

  const handlePrevMonth = () => {
    const prevMonth = selectedMonth.getMonth() - 1;
    const prevYear = selectedMonth.getFullYear();
    onChangeMonth(new Date(prevYear, prevMonth, 1));
    onDateSelect(clampDayToMonth(selectedDate.getDate(), prevYear, prevMonth));
  };

  const handleNextMonth = () => {
    const nextMonth = selectedMonth.getMonth() + 1;
    const nextYear = selectedMonth.getFullYear();
    onChangeMonth(new Date(nextYear, nextMonth, 1));
    onDateSelect(clampDayToMonth(selectedDate.getDate(), nextYear, nextMonth));
  };

  const handleSelectToday = () => {
    applyDateSelection(new Date());
  };

  const pickerValue = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth(),
    selectedDate.getDate()
  );

  const monthLabel = `${selectedMonth.getFullYear()}년 ${selectedMonth.getMonth() + 1}월`;

  return (
    <View>
      <CalendarHeader
        label={monthLabel}
        pickerValue={pickerValue}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onPickDate={applyDateSelection}
        onSelectToday={handleSelectToday}
      />
      <CalendarGrid cells={cells} onSelectDate={onDateSelect} />
      <CalendarLegend />
    </View>
  );
};

export default ProblemCalendar;
