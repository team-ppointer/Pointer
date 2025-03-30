'use client';

import Image from 'next/image';

import { Header, ImageContainer } from '@components';
import { useReportContext } from '@/hooks/report';

const Page = () => {
  const { problemNumber, mainAnalysisImageUrl, readingTipImageUrl } = useReportContext();

  if (!mainAnalysisImageUrl || !readingTipImageUrl) {
    return <></>;
  }

  return (
    <>
      <Header title='문제를 읽어내려갈 때' iconType='back' />
      <main className='px-[2rem] py-[8rem]'>
        <h1 className='font-bold-18 text-main my-[0.8rem]'>메인 문제 {problemNumber}번</h1>
        <div className='mt-[1.6rem] flex flex-col gap-[3.2rem] md:flex-row md:gap-[1.6rem]'>
          <div className='flex w-full flex-col gap-[1.2rem]'>
            <h2 className='font-bold-16 text-main my-[0.8rem]'>문제 분석</h2>
            <ImageContainer>
              <Image
                src={mainAnalysisImageUrl ?? ''}
                alt='analysis'
                className={`w-full object-contain`}
                width={700}
                height={200}
                priority
              />
            </ImageContainer>
          </div>
          <div className='flex w-full flex-col gap-[1.2rem]'>
            <h2 className='font-bold-16 text-main my-[0.8rem]'>문제를 읽어내려갈 때</h2>
            <ImageContainer>
              <Image
                src={readingTipImageUrl ?? ''}
                alt='reading-tip'
                className={`w-full object-contain`}
                width={700}
                height={200}
                priority
              />
            </ImageContainer>
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;
