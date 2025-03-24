'use client';

import { Header } from '@components';

import { ProblemStatusCard } from '@/components/problem';

const Page = () => {
  return (
    <>
      <Header title='문제 리스트' />
      <main className='px-[2rem] pt-[6rem]'>
        <p className='font-medium-16 mt-[3.2rem] text-black'>03월 21일 문제</p>
        <h1 className='font-bold-18 text-main mt-[0.8rem]'>
          점과 직선 사이의 거리 톺아보기 어쩌고 두줄짜리 제목목목모곰목
        </h1>
        <div className='mt-[3.2rem] flex flex-col gap-[1.6rem]'>
          <ProblemStatusCard title='메인 문제 1번' />
          <ProblemStatusCard title='메인 문제 2번' />
          <ProblemStatusCard title='메인 문제 3번' />
        </div>
      </main>
    </>
  );
};

export default Page;
