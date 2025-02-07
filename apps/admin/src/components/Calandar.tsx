import { HTMLAttributes, useState } from 'react';
import dayjs from 'dayjs';

import IconButton from './Buttons/IconButton';
import PlusButton from './Buttons/PlusButton';

import 'dayjs/locale/ko';
dayjs.locale('ko');

interface DayProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'thisMonth' | 'anotherMonth';
  day: number;
  dayOfWeek?: number; // 요일 - 0: Sunday ~ 6: Saturday
  event?: string;
}

const Day = ({ variant = 'thisMonth', day, dayOfWeek, event }: DayProps) => {
  const dayOfWeekStyle = dayOfWeek === 0 ? 'text-red' : dayOfWeek === 6 ? 'text-blue' : 'black';

  return (
    <div
      className={`flex h-[15rem] flex-col items-center gap-[0.4rem] border bg-white px-[2.4rem] py-[1.6rem] ${dayOfWeekStyle} `}>
      <div
        className={`font-medium-16 flex w-full items-center justify-end ${variant === 'anotherMonth' && 'text-lightgray500'}`}>
        {day}
      </div>
      {event ? (
        <p className='font-bold-18 h-full overflow-auto'>{event}</p>
      ) : (
        <div className='flex h-full w-full flex-col items-center justify-center'>
          <PlusButton variant={variant === 'anotherMonth' ? 'light' : 'dark'} />
        </div>
      )}
    </div>
  );
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));

  const handleClickPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const handleClickNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day(); // 1일 요일, 0: Sunday ~ 6: Saturday
  const lastDayOfMonth = currentMonth.endOf('month').day(); // 마지막날 요일, 0: Sunday ~ 6: Saturday
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = currentMonth.subtract(1, 'month');
  const daysInPrevMonth = prevMonth.daysInMonth();

  const publishData = [
    { date: '2025-03-02', text: '점과 직선 사이의 거리 돌아보기 점과 직선 사이의 거리 돌아보기' },
    { date: '2025-03-08', text: '점과 직선 사이의 거리 돌아보기' },
  ];

  return (
    <div className='w-full'>
      <div className='mb-[7.4rem] flex items-center justify-center gap-[4.8rem]'>
        <IconButton variant='left' onClick={handleClickPrevMonth} />
        <h2 className='font-bold-32'>{currentMonth.format('YYYY년 M월')}</h2>
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
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <Day
            key={`prev-${i}`}
            variant='anotherMonth'
            day={daysInPrevMonth - firstDayOfMonth + i + 1}
          />
        ))}

        {daysArray.map((day) => {
          const fullDate = currentMonth.date(day).format('YYYY-MM-DD');
          const event = publishData.find((e) => e.date === fullDate);
          const dayOfWeek = currentMonth.date(day).day();
          return <Day key={day} day={day} dayOfWeek={dayOfWeek} event={event?.text} />;
        })}

        {Array.from({ length: 6 - lastDayOfMonth }).map((_, i) => (
          <Day key={`next-${i}`} variant='anotherMonth' day={i + 1} />
        ))}
      </div>
    </div>
  );
};

export default Calendar;
