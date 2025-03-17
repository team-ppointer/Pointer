'use client';
import { Header } from '@components';
import dayjs from 'dayjs';
import { useState } from 'react';

import { ProblemCalandar } from '@/components/problem';

const Page = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));

  return (
    <>
      <Header title='전체 문제' />
      <main className='px-[2rem] pt-[6rem]'>
        <ProblemCalandar currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
      </main>
    </>
  );
};

export default Page;
