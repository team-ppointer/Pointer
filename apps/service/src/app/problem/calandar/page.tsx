'use client';
import { Header } from '@components';

import { ProblemCalandar } from '@/components/problem';

const Page = () => {
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
