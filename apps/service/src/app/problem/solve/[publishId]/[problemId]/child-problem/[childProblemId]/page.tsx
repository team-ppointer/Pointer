'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getChildProblemById } from '@apis';
import { putChildProblemSubmit, putChildProblemSkip } from '@apis';
import {
  AnswerInput,
  Button,
  PortalModal,
  NavigationFooter,
  ProgressHeader,
  SmallButton,
  ChildAnswerCheckModalTemplate,
} from '@components';
import { useModal } from '@hooks';
import { ProblemStatus } from '@types';

import { useChildProblemContext } from '@/hooks/problem';

const Page = () => {
  const { publishId, problemId, childProblemId } = useParams<{
    publishId: string;
    problemId: string;
    childProblemId: string;
  }>();
  const router = useRouter();
  const { childProblemLength, mainProblemImageUrl, onPrev, onNext } = useChildProblemContext();

  const { isOpen, openModal, closeModal } = useModal();
  const [result, setResult] = useState<ProblemStatus | undefined>();
  const { register, handleSubmit, watch } = useForm<{ answer: string }>();
  const selectedAnswer = watch('answer');

  // apis
  const { data } = getChildProblemById(publishId, problemId, childProblemId);
  const {
    problemNumber,
    childProblemNumber = 1,
    imageUrl,
    status,
    answerType = 'MULTIPLE_CHOICE',
    answer,
  } = data?.data ?? {};

  const prevButtonLabel =
    childProblemNumber === 1
      ? `메인 문제 ${problemNumber}번`
      : `새끼 문제 ${problemNumber}-${childProblemNumber - 1}번`;

  const nextButtonLabel =
    childProblemNumber === childProblemLength
      ? `메인 문제 ${problemNumber}번`
      : `새끼 문제 ${problemNumber}-${childProblemNumber + 1}번`;

  const isSolved = status === 'CORRECT' || status === 'RETRY_CORRECT';

  const handleSubmitAnswer: SubmitHandler<{ answer: string }> = async ({ answer }) => {
    const { data } = await putChildProblemSubmit(publishId, childProblemId, answer);
    const resultData = data?.data;

    setResult(resultData);
    if (resultData) {
      openModal();
    }
  };

  return (
    <>
      <ProgressHeader progress={(childProblemNumber / (childProblemLength + 1)) * 100} />
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
          <form onSubmit={handleSubmit(handleSubmitAnswer)}>
            <h3 className='font-bold-16 text-black'>정답 선택</h3>
            <div className='mt-[1.2rem] flex flex-col gap-[2rem] lg:flex-row'>
              <AnswerInput
                answerType={answerType}
                selectedAnswer={isSolved && answer ? answer : selectedAnswer}
                disabled={isSolved}
                {...register('answer')}
              />
              <Button disabled={isSolved}>제출하기</Button>
            </div>
          </form>
        </div>
      </main>

      <NavigationFooter
        prevLabel={prevButtonLabel}
        nextLabel={nextButtonLabel}
        onClickPrev={onPrev}
        onClickNext={onNext}
      />

      <PortalModal isOpen={isOpen} onClose={closeModal}>
        <ChildAnswerCheckModalTemplate
          result={result}
          onClose={closeModal}
          handleClickButton={onNext}
        />
      </PortalModal>
    </>
  );
};

export default Page;
