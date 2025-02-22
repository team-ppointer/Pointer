import { HTMLAttributes, useState } from 'react';
import dayjs from 'dayjs';
import { IcDeleteSm } from '@svg';
import { Link } from '@tanstack/react-router';

import IconButton from './Buttons/IconButton';
import PlusButton from './Buttons/PlusButton';

import 'dayjs/locale/ko';
dayjs.locale('ko');

interface DayProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'thisMonth' | 'anotherMonth';
  fullDate: string;
  day: number;
  dayOfWeek?: number; // 요일 - 0: Sunday ~ 6: Saturday
  title?: string;
}

const Day = ({ variant = 'thisMonth', fullDate, day, dayOfWeek, title }: DayProps) => {
  const today = dayjs().startOf('day');
  const isPast = dayjs(fullDate).isBefore(today, 'day');
  const isToday = dayjs(fullDate).isSame(today, 'day');
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  const dayOfWeekStyle = isSunday ? 'text-red' : isSaturday ? 'text-blue' : 'black';

  const textStyle = variant === 'thisMonth' ? 'text-black' : 'text-lightgray500';

  const todayBgStyle =
    isToday && variant === 'thisMonth'
      ? isSunday
        ? 'bg-lightred'
        : isSaturday
          ? 'bg-lightblue'
          : 'bg-lightgray500'
      : 'bg-white';

  return (
    <div
      className={`flex h-[15rem] flex-col items-end gap-[0.4rem] rounded-[4px] bg-white px-[2.4rem] py-[1.6rem]`}>
      <div className='flex w-full items-center justify-between'>
        <div
          className={`font-medium-16 h-[2.4rem] rounded-[0.4rem] px-[0.6rem] ${dayOfWeekStyle} ${textStyle} ${todayBgStyle}`}>
          {day}
        </div>
        <div>
          {title && !isPast && <IcDeleteSm width={24} height={24} className='cursor-pointer' />}
        </div>
      </div>

      {title ? (
        <p className={`font-bold-18 h-full w-full overflow-auto ${textStyle}`}>{title}</p>
      ) : (
        !isPast && (
          <Link
            to={`/publish/register/$publishDate`}
            params={{ publishDate: fullDate }}
            className='flex h-full w-full flex-col items-center justify-center'>
            <PlusButton variant={variant === 'anotherMonth' ? 'light' : 'dark'} />
          </Link>
        )
      )}
    </div>
  );
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));

  const handleClickPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const handleClickNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));
  const handleClickCurrentMonth = () => setCurrentMonth(dayjs().startOf('month'));

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day(); // 1일 요일, 0: Sunday ~ 6: Saturday
  const lastDayOfMonth = currentMonth.endOf('month').day(); // 마지막날 요일, 0: Sunday ~ 6: Saturday
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = currentMonth.subtract(1, 'month');
  const nextMonth = currentMonth.add(1, 'month');
  const daysInPrevMonth = prevMonth.daysInMonth();

  // 삭제예정
  const publishData = [
    { date: '2024-12-30', text: '점과 직선' },
    { date: '2025-03-01', text: '점과 직선 사이의 거리 돌아보기 점과 직선 사이의 거리 돌아보기' },
    { date: '2025-03-08', text: '점과 직선 사이의 거리 돌아보기' },
  ];

  return (
    <div className='w-full'>
      <div className='mb-[7.4rem] flex items-center justify-center gap-[4.8rem]'>
        <IconButton variant='left' onClick={handleClickPrevMonth} />
        <h2 className='font-bold-32 cursor-pointer' onClick={handleClickCurrentMonth}>
          {currentMonth.format('YYYY년 M월')}
        </h2>
        <IconButton variant='right' onClick={handleClickNextMonth} />
      </div>

      <div className='font-medium-18 grid grid-cols-7 text-center'>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`py-[1.45rem] ${index === 0 ? 'text-red' : index === 6 ? 'text-blue' : ''}`}>
            {`${day}요일`}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-[0.8rem]'>
        {Array.from({ length: firstDayOfMonth }).map((_, i) => {
          const fullDate = prevMonth
            .date(daysInPrevMonth - firstDayOfMonth + i + 1)
            .format('YYYY-MM-DD');
          const title = publishData.find((e) => e.date === fullDate);

          return (
            <Day
              key={`prev-${i}`}
              variant='anotherMonth'
              day={daysInPrevMonth - firstDayOfMonth + i + 1}
              fullDate={fullDate}
              title={title?.text}
            />
          );
        })}

        {daysArray.map((day) => {
          const fullDate = currentMonth.date(day).format('YYYY-MM-DD');
          const title = publishData.find((e) => e.date === fullDate);
          const dayOfWeek = currentMonth.date(day).day();
          return (
            <Day
              key={day}
              day={day}
              dayOfWeek={dayOfWeek}
              title={title?.text}
              fullDate={fullDate}
            />
          );
        })}

        {Array.from({ length: 6 - lastDayOfMonth }).map((_, i) => {
          const fullDate = nextMonth.date(i + 1).format('YYYY-MM-DD');
          const title = publishData.find((e) => e.date === fullDate);

          return (
            <Day
              key={`next-${i}`}
              variant='anotherMonth'
              day={i + 1}
              fullDate={fullDate}
              title={title?.text}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
