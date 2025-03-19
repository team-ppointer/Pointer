'use client';
import { Header } from '@/components/common';
import { useReport } from '@/hooks/report';

const Page = () => {
  const { analysis, readingTip } = useReport();

  return (
    <>
      <Header title='문제를 읽어내려갈 때' iconType='back' />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>메인 문제 1번</h1>
        <div className='mt-[1.6rem] flex flex-col gap-[3.2rem] md:flex-row md:gap-[1.6rem]'>
          <div className='flex w-full flex-col gap-[1.2rem]'>
            <h2 className='font-bold-16 text-main my-[0.8rem]'>문제 분석</h2>
            <img
              src={analysis}
              alt='analysis'
              className={`w-full rounded-[1.6rem] object-contain`}
            />
          </div>
          <div className='flex w-full flex-col gap-[1.2rem]'>
            <h2 className='font-bold-16 text-main my-[0.8rem]'>문제를 읽어내려갈 때</h2>
            <img
              src={readingTip}
              alt='reading-tip'
              className={`w-full rounded-[1.6rem] object-contain`}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;
