import { useMemo } from 'react';

import { formatDateKey, isSameDay } from '@/utils/date';

import { publishProgressMap } from '../components/ProblemCalendar/constants';
import {
  type CalendarCell,
  type CalendarProgress,
  type PublishResp,
} from '../components/ProblemCalendar/types';

interface UseCalendarDataParams {
  selectedMonth: Date;
  selectedDate: Date;
  studyData: PublishResp[];
}

export const useCalendarData = ({
  selectedMonth,
  selectedDate,
  studyData,
}: UseCalendarDataParams): CalendarCell[] => {
  const progressByDate = useMemo(() => {
    return studyData.reduce<Record<string, CalendarProgress>>((acc, publish) => {
      acc[publish.publishAt] = publishProgressMap[publish.progress] ?? 'unavailable';
      return acc;
    }, {});
  }, [studyData]);

  return useMemo(() => {
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

      return {
        key: `${cellDate.toISOString()}-${index}`,
        date: cellDate,
        label: cellDate.getDate(),
        progress,
        isSelected: isSameDay(selectedDate, cellDate),
        disabled: !isCurrentMonth,
      };
    });
  }, [progressByDate, selectedDate, selectedMonth]);
};
