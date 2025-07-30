'use client';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';

import { Header } from '@components';
import { ProblemStatusCard } from '@/components/problem';
import { useGetProblemsTeacherByPublishId } from '@/apis/controller-teacher/problem';

const Page = () => {
  const { publishId } = useParams<{ publishId: string }>();

  const { data } = useGetProblemsTeacherByPublishId(publishId);
  console.log(data);
  const { id, publishAt, problemSet, data: problems } = data ?? {};
  const publishDate = dayjs(publishAt).format('MM월 DD일');

  return (
    <>
      <Header title='문제 리스트' />
      <main className='px-[2rem] pt-[6rem]'>
        <p className='font-medium-16 mt-[3.2rem] text-black'>{publishDate} 문제</p>
        <h1 className='font-bold-18 text-main mt-[0.8rem]'>{problemSet?.title}</h1>
        <div className='mt-[3.2rem] flex flex-col gap-[1.6rem]'>
          {problems?.map((problem, index) => {
            return (
              <ProblemStatusCard
                key={index}
                mainProblemNumber={problem.no}
                problemId={problem.problemId}
                problemData={problem}
                publishId={+publishId}
              />
            );
          })}
        </div>
      </main>
    </>
  );
};

export default Page;
