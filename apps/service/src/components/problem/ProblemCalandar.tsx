'use client';
import dayjs from 'dayjs';
import { useState } from 'react';
import { IcNextBlack, IcPrevBlack } from '@svg';
import { components } from '@schema';
import { getProblemAll } from '@apis';

import DayProblemCard from './DayProblemCard';

type AllProblemGetResponse = components['schemas']['AllProblemGetResponse'];

const ProblemCalandar = () => {
  const [currentDay, setCurrentDay] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDay.year();
  const month = currentDay.month() + 1;

  // apis
  const { data: publishedData } = getProblemAll({ year, month });

  const publishedDataArray: AllProblemGetResponse[] = Array.from({ length: 31 }).map(() => ({}));
  (publishedData?.data ?? []).forEach((data) => {
    const date = dayjs(data.date);
    const day = date.date();
    publishedDataArray[day] = data;
  });

  const progressColor = (day: number) => {
    const data = publishedDataArray[day];
    if (!data) return 'bg-lightgray300';
    if (data.progress === 'COMPLETE') return 'bg-main';
    else if (data.progress === 'IN_PROGRESS') return 'bg-sub1';
    else if (data.progress === 'INCOMPLETE') return 'bg-lightgray300';
    return 'bg-lightgray300';
  };

  const handleClickPrevMonth = () => setCurrentDay(currentDay.subtract(1, 'month'));
  const handleClickNextMonth = () => setCurrentDay(currentDay.add(1, 'month'));
  const handleClickCurrentMonth = () => setCurrentDay(dayjs().startOf('month'));

  const firstDayOfMonth = currentDay.startOf('month').day(); // 1일 요일, 0: Sunday ~ 6: Saturday
  const firstWeekdayOfMonth = firstDayOfMonth === 0 || firstDayOfMonth === 6 ? 1 : firstDayOfMonth;

  const daysInMonth = currentDay.daysInMonth();

  const weekdaysArray: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .map((day) => {
      const date = currentDay.date(day);
      const dayOfWeek = date.day(); // 0: 일요일, 6: 토요일
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        return day;
      }
      return null;
    })
    .filter((day) => day !== null);

  return (
    <div className='flex flex-col gap-[2.4rem] pt-[2rem]'>
      <div className='flex items-center justify-between'>
        <IcPrevBlack width={24} height={24} onClick={handleClickPrevMonth} />
        <p className='font-bold-18 text-main' onClick={handleClickCurrentMonth}>
          {`${month}월`} 진행도
        </p>
        <IcNextBlack width={24} height={24} onClick={handleClickNextMonth} />
      </div>
      <div className='flex flex-col gap-[2.4rem] md:flex-row'>
        <div className='flex w-full flex-col items-center gap-[2rem] rounded-[16px] bg-white px-[3.2rem] py-[2.4rem] md:w-[33.5rem]'>
          <div className='grid w-[26.8rem] grid-cols-5 gap-[1.2rem]'>
            {['월', '화', '수', '목', '금'].map((day) => (
              <div key={day} className={`font-medium-12 text-midgray100 text-center`}>
                {`${day}`}
              </div>
            ))}
          </div>

          <div className='grid w-[26.8rem] grid-cols-5 gap-[1.2rem]'>
            {Array.from({ length: firstWeekdayOfMonth - 1 }).map((_, index) => {
              return <div key={index} className='h-[4.4rem] rounded-[4px] bg-white'></div>;
            })}

            {weekdaysArray.map((day) => {
              return (
                <div
                  key={day}
                  className={`font-medium-16 flex h-[4.4rem] w-[4.4rem] items-center justify-center rounded-[16px] text-white ${progressColor(day)}`}
                  onClick={() => setSelectedDay(day)}>
                  {day}
                </div>
              );
            })}
          </div>
          <div className='flex w-full items-center justify-end gap-[1.6rem]'>
            <div className='flex items-center gap-[0.6rem]'>
              <div className='bg-main h-[1.4rem] w-[1.4rem] rounded-[5px]' />
              <p className='font-medium-12 text-midgray100'>완료</p>
            </div>
            <div className='flex items-center gap-[0.6rem]'>
              <div className='bg-sub1 h-[1.4rem] w-[1.4rem] rounded-[5px]' />
              <p className='font-medium-12 text-midgray100'>진행중</p>
            </div>
            <div className='flex items-center gap-[0.6rem]'>
              <div className='bg-lightgray300 h-[1.4rem] w-[1.4rem] rounded-[5px]' />
              <p className='font-medium-12 text-midgray100'>미완료</p>
            </div>
          </div>
        </div>
        {selectedDay && publishedDataArray[selectedDay].publishId && (
          <DayProblemCard dayProblemData={publishedDataArray[selectedDay]} />
        )}
      </div>
    </div>
  );
};

export default ProblemCalandar;
