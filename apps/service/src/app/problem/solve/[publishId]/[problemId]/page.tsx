'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';

import { useGetProblemThumbnail } from '@apis';
import { ImageContainer, ProgressHeader, TimeTag } from '@components';

import SolveButtonsClient from './SolveButtonsClient';

const Page = () => {
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();

  const { data, isLoading } = useGetProblemThumbnail(publishId, problemId);
  const { number, imageUrl, recommendedMinute, recommendedSecond } = data?.data ?? {};

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <ProgressHeader progress={0} />
      <main className='p-[2rem] pt-[8rem]'>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold-18 text-main'>메인 문제 {number}번</h1>
          <TimeTag minutes={recommendedMinute} seconds={recommendedSecond} />
        </div>
        <ImageContainer className='mt-[1.2rem]'>
          <Image
            src={imageUrl ?? ''}
            alt={`메인 문제 ${number}번`}
            className='w-full object-contain'
            width={700}
            height={200}
            priority
          />
        </ImageContainer>

        <SolveButtonsClient publishId={publishId} problemId={problemId} />
      </main>
    </>
  );
};

export default Page;
