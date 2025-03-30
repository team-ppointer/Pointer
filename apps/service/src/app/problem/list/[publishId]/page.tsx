'use client';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';

import { Header } from '@components';
import { useGetProblemsByPublishId } from '@apis';
import { ProblemStatusCard } from '@/components/problem';

const Page = () => {
  const { publishId } = useParams<{ publishId: string }>();

  const { data } = useGetProblemsByPublishId(publishId);
  const { date, problems, title } = data?.data ?? {};
  const publishDate = dayjs(date).format('MM월 DD일');

  return (
    <>
      <Header title='문제 리스트' />
      <main className='px-[2rem] pt-[6rem]'>
        <p className='font-medium-16 mt-[3.2rem] text-black'>{publishDate} 문제</p>
        <h1 className='font-bold-18 text-main mt-[0.8rem]'>{title}</h1>
        <div className='mt-[3.2rem] flex flex-col gap-[1.6rem]'>
          {problems?.map((problem, index) => {
            return (
              <ProblemStatusCard
                key={problem.problemId}
                mainProblemNumber={index + 1}
                publishId={publishId}
                problemData={problem}
              />
            );
          })}
        </div>
      </main>
    </>
  );
};

export default Page;
