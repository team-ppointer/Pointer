'use client';
import { NavigationFooter, ProgressHeader, SmallButton } from '@components';
import { useParams, useRouter } from 'next/navigation';
import { getChildProblemById } from '@apis';

import { AnswerInputForm } from '@/components/problem';
import { useChildProblemContext } from '@/hooks/problem';

const Page = () => {
  const { publishId, problemId, childProblemId } = useParams<{
    publishId: string;
    problemId: string;
    childProblemId: string;
  }>();
  const router = useRouter();
  const { childProblemLength, mainProblemImageUrl, onPrev, onNext } = useChildProblemContext();

  const { data } = getChildProblemById(publishId, problemId, childProblemId);
  const { problemNumber, childProblemNumber = 1, imageUrl, status } = data?.data ?? {};

  const prevButtonLabel =
    childProblemNumber === 1
      ? `메인 문제 ${problemNumber}번`
      : `새끼 문제 ${problemNumber}-${childProblemNumber - 1}번`;

  const nextButtonLabel =
    childProblemNumber === childProblemLength
      ? `메인 문제 ${problemNumber}번`
      : `새끼 문제 ${problemNumber}-${childProblemNumber + 1}번`;

  const isSolved = status === 'CORRECT' || status === 'RETRY_CORRECT';

  return (
    <>
      <ProgressHeader progress={10} />
      <main className='flex flex-col px-[2rem] py-[8rem] md:flex-row md:gap-[4rem]'>
        <div className='w-full'>
          <h1 className='font-bold-18 text-main'>
            새끼 문제 {problemNumber}-{childProblemNumber}번
          </h1>
          <img
            src={imageUrl}
            alt={`새끼 문제 ${problemNumber}-${childProblemNumber}번`}
            className='mt-[1.2rem] w-full object-contain'
          />

          <div className='mt-[0.6rem] mb-[0.4rem] flex items-center justify-end'>
            <SmallButton
              variant='underline'
              sizeType='small'
              onClick={() => router.push(`/image-modal?imageUrl=${mainProblemImageUrl}`)}>
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
            isSolved={isSolved}
          />
        </div>
      </main>

      <NavigationFooter
        prevLabel={prevButtonLabel}
        nextLabel={nextButtonLabel}
        onClickPrev={onPrev}
        onClickNext={onNext}
      />
    </>
  );
};

export default Page;
