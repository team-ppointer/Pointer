'use client';
import { Header } from '@components';
import { getProblemAll } from '@apis';

import { ProblemCalandar } from '@/components/problem';
const Page = () => {
  const { data } = getProblemAll({ year: 2025, month: 3 });
  console.log(data);

  return (
    <>
      <Header title='전체 문제' />
      <main className='px-[2rem] pt-[6rem]'>
        <ProblemCalandar />
      </main>
    </>
  );
};

export default Page;
