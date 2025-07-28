'use client';
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Slide, ToastContainer } from 'react-toastify';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import { clsx } from 'clsx';

import { useGetProblemById, postProblemSubmit } from '@apis';
import {
  AnswerInput,
  Button,
  Tag,
  ProgressHeader,
  SmallButton,
  TimeTag,
  ImageContainer,
  MainAnswerCheckBottomSheetTemplate,
  BottomSheet,
} from '@components';
import { useInvalidate, useModal } from '@hooks';
import { ProblemStatus } from '@types';
import { useChildProblemContext } from '@/hooks/problem';
import { copyImageToClipboard, trackEvent } from '@utils';
import { IcArrowGrow14, IcCommentCheck20, IcCopy, IcCopyBig, IcQuestion18 } from '@svg';

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
  const { invalidateAll } = useInvalidate();

  const { isOpen, openModal, closeModal } = useModal();
  const [result, setResult] = useState<ProblemStatus | undefined>();
  const [localResult, setLocalResult] = useState<ProblemStatus | undefined>();
  const { register, handleSubmit, watch, setValue } = useForm<{ answer: string }>();
  const selectedAnswer = watch('answer');
  const problemViewerRef = useRef<HTMLDivElement>(null);

  // apis
  const { data: problemData } = useGetProblemById(+publishId, +problemId);

  if (!problemData) return;
  const {
    id,
    no,
    recommendedTimeSec,
    problemContent,
    answerType,
    answer,
    childProblems,
    progress,
  } = problemData;
  const childProblemId = childProblems[0]?.id || 0;

  const isCorrect = localResult
    ? localResult === 'CORRECT' || localResult === 'SEMI_CORRECT'
    : progress === 'CORRECT' || progress === 'SEMI_CORRECT';

  const hasChildProblem = childProblemLength > 0;

  const seconds = recommendedTimeSec % 60;
  const minutes = Math.floor(recommendedTimeSec / 60);

  const handleSubmitAnswer: SubmitHandler<{ answer: string }> = async ({ answer }) => {
    const { data } = await postProblemSubmit(+publishId, +problemId, null, +answer);

    const resultData = data?.progress;

    setLocalResult(resultData);

    invalidateAll();
    setResult(resultData);

    if (resultData) {
      openModal();
    }
  };

  const handleClickStepSolve = async () => {
    trackEvent('problem_main_solve_step_solve_button_click');
    invalidateAll();
    router.push(`/problem/solve/${publishId}/${problemId}/child-problem/${childProblemId}`);
  };

  const handleClickPointing = () => {
    trackEvent('problem_main_solve_pointing_button_click');
    invalidateAll();
    router.push(`/report/${publishId}/${problemId}/prescription/detail?type=main`);
  };

  const handleClickSolveAgain = () => {
    trackEvent('problem_main_solve_check_modal_solve_again_button_click');
    closeModal();
  };

  const handleClickShowReport = () => {
    trackEvent('problem_main_solve_check_modal_commentary_button_click');
    router.push(`/report/${publishId}/${problemId}/analysis`);
  };

  const handleClickCopyProblemImage = async () => {
    copyImageToClipboard(problemViewerRef);
  };

  const handleClickQuestion = () => {
    trackEvent('problem_main_solve_question_button_click');
    invalidateAll();
    router.push(`/qna/ask?publishId=${publishId}&problemId=${problemId}&type=PROBLEM_CONTENT`);
  };

  const handleClickAnalysis = () => {
    trackEvent('problem_main_solve_analysis_button_click');
    invalidateAll();
    router.push(`/report/${publishId}/${problemId}/analysis`);
  };

  return (
    <>
      <ToastContainer
        position='bottom-center'
        autoClose={1000}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnHover={false}
        hideProgressBar
        transition={Slide}
        closeButton={false}
        style={{
          fontSize: '1.6rem',
          width: '30rem',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '3rem',
        }}
      />
      <ProgressHeader />
      <main className='flex flex-col px-[2rem] py-[8rem] pb-[20rem]'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center justify-between gap-[1.2rem]'>
              <h1 className='font-bold-18 text-main'>메인 문제 {no}번</h1>
              <TimeTag minutes={minutes} seconds={seconds} />
            </div>
            {(localResult === 'CORRECT' ||
              localResult === 'SEMI_CORRECT' ||
              (!localResult && (progress === 'CORRECT' || progress === 'SEMI_CORRECT'))) && (
              <Tag variant='green' sizeType='medium'>
                정답
              </Tag>
            )}
            {(localResult === 'INCORRECT' || (!localResult && progress === 'INCORRECT')) && (
              <Tag variant='red' sizeType='medium'>
                오답
              </Tag>
            )}
            {!localResult && progress === 'NONE' && <Tag sizeType='medium'>미완</Tag>}
          </div>
          <ImageContainer className='relative mt-[1.2rem]' ref={problemViewerRef}>
            <ProblemViewer problem={problemContent} loading={false} />
          </ImageContainer>

          {hasChildProblem && (
            <div className='tems-center right-0 mt-[0.6rem] flex items-end justify-end'>
              <div className='mt-[0.6rem] flex items-center justify-end gap-[0.8rem]'>
                <SmallButton
                  className='flex flex-row gap-[4px]'
                  variant='white'
                  sizeType='small'
                  onClick={handleClickPointing}>
                  <IcCommentCheck20 width={14} height={14} viewBox='0 0 20 20' />
                  포인팅 보기
                </SmallButton>
                {childProblemLength > 0 && (
                  <SmallButton
                    className='flex flex-row gap-[4px]'
                    variant='white'
                    sizeType='small'
                    onClick={handleClickStepSolve}>
                    <IcArrowGrow14 className='mt-2 flex h-[1.8rem] w-[1.8rem]' />
                    단계적으로 풀기
                  </SmallButton>
                )}
                <div
                  className='bg-sub2 cursor-pointer rounded-[0.8rem] p-[0.5rem]'
                  onClick={handleClickQuestion}>
                  <IcQuestion18 width={20} height={20} />
                </div>
                <div className='bg-sub2 cursor-pointer rounded-[0.8rem] p-[0.5rem]'>
                  <IcCopyBig
                    width={20}
                    height={20}
                    onClick={handleClickCopyProblemImage}
                    viewBox='0 0 24 24'
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='fixed right-0 bottom-0 left-0 z-10 p-[2rem]'>
          <form onSubmit={handleSubmit(handleSubmitAnswer)}>
            <h3 className='font-bold-16 text-black'>정답 선택</h3>
            <div
              className={clsx(
                'mt-[1.2rem] flex flex-col gap-[2rem]',
                answerType === 'MULTIPLE_CHOICE' ? '' : 'md:flex-grow md:flex-row'
              )}>
              <AnswerInput
                className={clsx(answerType === 'MULTIPLE_CHOICE' ? '' : 'md:flex-1')}
                answerType={answerType}
                selectedAnswer={isCorrect && answer ? String(answer) : selectedAnswer}
                disabled={isCorrect}
                {...register('answer')}
              />
              {isCorrect ? (
                <Button
                  type='button'
                  onClick={handleClickAnalysis}
                  className={clsx(answerType === 'MULTIPLE_CHOICE' ? '' : 'md:flex-1')}>
                  해설보기
                </Button>
              ) : (
                <Button className={clsx(answerType === 'MULTIPLE_CHOICE' ? '' : 'md:flex-1')}>
                  제출하기
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
      <BottomSheet isOpen={isOpen} onClose={closeModal}>
        <MainAnswerCheckBottomSheetTemplate
          result={result}
          onClose={handleClickSolveAgain}
          handleClickStepSolve={handleClickStepSolve}
          handleClickShowReport={handleClickShowReport}
        />
      </BottomSheet>
    </>
  );
};

export default Page;
