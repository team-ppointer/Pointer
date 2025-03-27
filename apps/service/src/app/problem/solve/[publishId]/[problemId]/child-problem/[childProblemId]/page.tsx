'use client';

import { NavigationFooter, ProgressHeader, SmallButton } from '@components';

import { AnswerInputForm } from '@/components/problem';

type Params = {
  publishId: string;
  problemId: string;
  childProblemId: string;
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { publishId, problemId, childProblemId } = await params;

  return (
    <>
      <ProgressHeader progress={10} />
      <main className='flex flex-col px-[2rem] py-[8rem] md:flex-row md:gap-[4rem]'>
        <div className='w-full'>
          <h1 className='font-bold-18 text-main'>문제 1번</h1>
          <img
            src='https://placehold.co/600x400'
            alt='문제 1'
            className='mt-[1.2rem] w-full object-contain'
          />

          <div className='mt-[0.6rem] mb-[0.4rem] flex items-center justify-end'>
            <SmallButton variant='underline' sizeType='small'>
              메인 문제 다시보기
            </SmallButton>
          </div>
        </div>

        <div className='w-full'>
          <AnswerInputForm
            publishId={publishId}
            problemId={problemId}
            childProblemId={childProblemId}
            answerType={'SHORT_ANSWER'}
          />
        </div>
      </main>

      <NavigationFooter
        prevLabel='이전'
        nextLabel='다음'
        onClickPrev={() => {}}
        onClickNext={() => {}}
      />
    </>
  );
};

export default Page;
