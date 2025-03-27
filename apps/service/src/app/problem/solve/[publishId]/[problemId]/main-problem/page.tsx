'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { getProblemById, putProblemSubmit } from '@apis';
import {
  AnswerInput,
  Button,
  MainAnswerCheckModalTemplate,
  PortalModal,
  Tag,
  TimeTag,
  ProgressHeader,
  SmallButton,
  NavigationFooter,
} from '@components';
import { useModal } from '@hooks';
import { ProblemStatus } from '@types';

import { useChildProblemContext } from '@/hooks/problem';

const statusLabel: Record<string, string> = {
  CORRECT: '정답',
  INCORRECT: '오답',
  RETRY_CORRECT: '정답',
  NOT_STARTED: '시작전',
};

const statusColor: Record<string, 'green' | 'red' | 'gray'> = {
  CORRECT: 'green',
  INCORRECT: 'red',
  RETRY_CORRECT: 'green',
  NOT_STARTED: 'gray',
};

const Page = () => {
  const { publishId, problemId } = useParams<{ publishId: string; problemId: string }>();
  const router = useRouter();
  const { childProblemLength } = useChildProblemContext();

  const { isOpen, openModal, closeModal } = useModal();
  const [result, setResult] = useState<ProblemStatus | undefined>();
  const { register, handleSubmit, watch } = useForm<{ answer: string }>();
  const selectedAnswer = watch('answer');

  // apis
  const { data } = getProblemById(publishId, problemId);

  const {
    number,
    imageUrl,
    recommendedMinute,
    recommendedSecond,
    status,
    childProblemStatuses = [],
    answerType = 'MULTIPLE_CHOICE',
    answer,
  } = data?.data ?? {};

  const isSolved = status === 'CORRECT' || status === 'RETRY_CORRECT';
  const isSubmitted = status === 'CORRECT' || status === 'RETRY_CORRECT' || status === 'INCORRECT';
  const isDirect =
    childProblemStatuses.length === 0 ||
    childProblemStatuses[childProblemStatuses.length - 1] === 'NOT_STARTED';

  const prevButtonLabel = isDirect
    ? `메인 문제 ${number}번`
    : `새끼 문제 ${number}-${childProblemLength}번`;
  const nextButtonLabel = '해설 보기';

  const handleSubmitAnswer: SubmitHandler<{ answer: string }> = async ({ answer }) => {
    const { data } = await putProblemSubmit(publishId, problemId, answer);
    const resultData = data?.data;

    setResult(resultData);
    if (resultData) {
      openModal();
    }
  };

  return (
    <>
      <ProgressHeader progress={100} />
      <main className='flex flex-col px-[2rem] py-[8rem] md:flex-row md:gap-[4rem]'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <h1 className='font-bold-18 text-main'>메인 문제 {number}번</h1>
            <TimeTag minutes={recommendedMinute} seconds={recommendedSecond} />
          </div>
          <img
            src={imageUrl}
            alt={`메인 문제 ${number}번`}
            className='mt-[1.2rem] w-full object-contain'
          />

          {isDirect && (
            <div className='mt-[0.6rem] flex items-center justify-end'>
              <SmallButton
                variant='underline'
                sizeType='small'
                onClick={() => router.push(`/problem/solve/${publishId}/${problemId}`)}>
                단계별로 풀어보기
              </SmallButton>
            </div>
          )}
        </div>

        {!isDirect && childProblemStatuses.length > 0 && (
          <div className='mt-[2.4rem] w-full'>
            <h3 className='font-bold-16 text-black'>새끼 문제 정답</h3>
            <div className='mt-[1.2rem] flex gap-[1.6rem]'>
              {childProblemStatuses.map((childProblemStatus, index) => (
                <div key={index} className='flex items-center gap-[0.6rem]'>
                  <span className='font-medium-16 text-black'>
                    {number}-{index + 1}번
                  </span>
                  <Tag variant={statusColor[childProblemStatus]}>
                    {statusLabel[childProblemStatus]}
                  </Tag>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='mt-[2.8rem] w-full'>
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
        nextLabel={isSubmitted ? nextButtonLabel : undefined}
        onClickPrev={() => router.back()}
        onClickNext={
          isSubmitted ? () => router.push(`/report/${publishId}/${problemId}/analysis`) : undefined
        }
      />

      <PortalModal isOpen={isOpen} onClose={closeModal}>
        <MainAnswerCheckModalTemplate result={result} onClose={closeModal} />
      </PortalModal>
    </>
  );
};

export default Page;
