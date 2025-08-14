import { useState, useEffect, useMemo, useCallback } from 'react';
import { IcLeftButton, IcRightButton } from '@svg';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  error?: string;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onDateRangeChange,
  error,
}: DateRangePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(
    startDate ? new Date(startDate + 'T00:00:00') : null
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(
    endDate ? new Date(endDate + 'T00:00:00') : null
  );

  const calendarDays = useMemo(() => {
    // 현재 월의 첫 번째 날과 마지막 날
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // 달력 시작일 (이전 월의 마지막 주 포함)
    const startDate_calendar = new Date(firstDayOfMonth);
    startDate_calendar.setDate(startDate_calendar.getDate() - firstDayOfMonth.getDay());

    // 달력 종료일 (다음 월의 첫 주 포함)
    const endDate_calendar = new Date(lastDayOfMonth);
    endDate_calendar.setDate(endDate_calendar.getDate() + (6 - lastDayOfMonth.getDay()));

    // 달력에 표시할 날짜들 생성
    const days = [];
    const currentDate = new Date(startDate_calendar);

    while (currentDate <= endDate_calendar) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth]);

  const handleDateClick = useCallback(
    (date: Date) => {
      const clickedDate = new Date(date);

      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        // 새로운 범위 시작
        setSelectedStartDate(clickedDate);
        setSelectedEndDate(null);
      } else if (clickedDate < selectedStartDate) {
        // 시작일보다 이전 날짜를 클릭한 경우, 새로운 시작일로 설정
        setSelectedStartDate(clickedDate);
        setSelectedEndDate(null);
      } else {
        // 종료일 설정
        setSelectedEndDate(clickedDate);
      }
    },
    [selectedStartDate, selectedEndDate]
  );

  // 날짜가 선택 범위에 포함되는지 확인
  const isInRange = useCallback(
    (date: Date) => {
      if (!selectedStartDate || !selectedEndDate) return false;
      return date >= selectedStartDate && date <= selectedEndDate;
    },
    [selectedStartDate, selectedEndDate]
  );

  // 날짜가 시작일인지 확인
  const isStartDate = useCallback(
    (date: Date) => {
      return selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
    },
    [selectedStartDate]
  );

  // 날짜가 종료일인지 확인
  const isEndDate = useCallback(
    (date: Date) => {
      return selectedEndDate && date.toDateString() === selectedEndDate.toDateString();
    },
    [selectedEndDate]
  );

  // 현재 월의 날짜인지 확인
  const isCurrentMonth = useCallback(
    (date: Date) => {
      return date.getMonth() === currentMonth.getMonth();
    },
    [currentMonth]
  );

  // 이전 달로 이동
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }, [currentMonth]);

  // 다음 달로 이동
  const goToNextMonth = useCallback(() => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }, [currentMonth]);

  // 선택된 날짜가 변경될 때 부모 컴포넌트에 알림
  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startFormatted = formatDate(selectedStartDate);
      const endFormatted = formatDate(selectedEndDate);

      console.log('DateRangePicker: 선택된 날짜 범위', {
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        startFormatted,
        endFormatted,
      });

      onDateRangeChange(startFormatted, endFormatted);
    }
  }, [selectedStartDate, selectedEndDate, onDateRangeChange]);

  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className='w-full'>
      <div className='border-lightgray500 rounded-400 border bg-white px-800 py-600'>
        {/* 헤더 */}
        <div className='mb-600 flex items-center justify-between'>
          <h3 className='font-bold-18 text-black'>공지 기간 설정</h3>
          <div className='flex items-center gap-400'>
            <button
              type='button'
              onClick={goToPreviousMonth}
              className='transition-opacity hover:opacity-70'>
              <IcLeftButton className='h-[3.6rem] w-[3.6rem]' />
            </button>
            <span className='font-bold-16 min-w-[8rem] text-center text-black'>
              {currentMonth.getFullYear()}년 {monthNames[currentMonth.getMonth()]}
            </span>
            <button
              type='button'
              onClick={goToNextMonth}
              className='transition-opacity hover:opacity-70'>
              <IcRightButton className='h-[3.6rem] w-[3.6rem]' />
            </button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className='mb-600 grid grid-cols-7 gap-200'>
          {dayNames.map((day) => (
            <div key={day} className='font-medium-12 text-midgray100 text-center'>
              {day}
            </div>
          ))}
        </div>

        {/* 달력 본체 */}
        <div className='grid grid-cols-7 gap-300'>
          {calendarDays.map((date, index) => {
            const isStart = isStartDate(date);
            const isEnd = isEndDate(date);
            const inRange = isInRange(date);
            const currentMonthDate = isCurrentMonth(date);

            let buttonClass = 'w-[4.4rem] h-[4.4rem] rounded-400 font-medium-16 ';

            if (!currentMonthDate) {
              buttonClass += 'opacity-0 pointer-events-none ';
            } else if (isStart || isEnd) {
              buttonClass += 'bg-darkgray100 text-white ';
            } else if (inRange) {
              buttonClass += 'bg-lightgray500 text-white ';
            } else {
              buttonClass += 'text-black hover:bg-lightgray200 ';
            }

            return (
              <button
                key={index}
                type='button'
                onClick={() => handleDateClick(date)}
                className={buttonClass}>
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* {selectedStartDate && selectedEndDate && (
          <div className='bg-lightgray50 rounded-400 mt-600 p-400'>
            <p className='font-medium-14 text-black'>
              선택된 기간: {selectedStartDate.toLocaleDateString('ko-KR')} ~{' '}
              {selectedEndDate.toLocaleDateString('ko-KR')}
            </p>
          </div>
        )} */}
      </div>

      {error && <p className='font-medium-14 text-red mt-200'>{error}</p>}
    </div>
  );
};

export default DateRangePicker;
