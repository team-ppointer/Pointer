'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import { Slide, ToastContainer } from 'react-toastify';

import { useGetProblemById, putProblemSubmit, postProblemSubmit } from '@apis';
import {
  AnswerInput,
  Button,
  Tag,
  ProgressHeader,
  SmallButton,
  NavigationFooter,
  TimeTag,
  ImageContainer,
  CopyButton,
  MainAnswerCheckBottomSheetTemplate,
  BottomSheet,
} from '@components';
import { useInvalidate, useModal } from '@hooks';
import { ProblemStatus } from '@types';
import { useChildProblemContext } from '@/hooks/problem';
import { copyImageToClipboard, trackEvent } from '@utils';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

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
  const { register, handleSubmit, watch } = useForm<{ answer: string }>();
  const selectedAnswer = watch('answer');

  // apis
  const { data } = useGetProblemById(+publishId, +problemId);

  // const {
  //   no,
  //   imageUrl,
  //   recommendedMinute,
  //   recommendedSecond,
  //   status,
  //   childProblemStatuses = [],
  //   answerType = 'MULTIPLE_CHOICE',
  //   answer,
  // } = data;
  const {
    no,
    childProblems = [],
    answerType,
    answer,
    problemContent,
    recommendedTimeSec = 0,
  } = data ?? {};

  const seconds = recommendedTimeSec % 60;
  const minutes = Math.floor(recommendedTimeSec / 60);

  const isSolved = status === 'CORRECT' || status === 'SEMI_CORRECT';
  const isSubmitted = status === 'CORRECT' || status === 'SEMI_CORRECT' || status === 'INCORRECT';
  const isDirect =
    childProblems.length > 0 && childProblems[childProblems.length - 1].progress === 'NONE';

  const prevButtonLabel =
    isDirect || childProblemLength === 0
      ? `메인 문제 ${no}번`
      : `새끼 문제 ${no}-${childProblemLength}번`;
  const nextButtonLabel = '해설 보기';

  const handleSubmitAnswer: SubmitHandler<{ answer: string }> = async ({ answer }) => {
    const { data } = await postProblemSubmit(+publishId, +problemId, null, +answer);
    const resultData = data?.progress;
    invalidateAll();

    setResult(resultData);
    if (resultData) {
      openModal();
    }
  };

  const handleClickStepSolve = () => {
    trackEvent('problem_main_solve_step_solve_button_click');
    router.push(`/problem/solve/${publishId}/${problemId}`);
  };

  const handleClickPrev = () => {
    trackEvent('problem_main_solve_footer_prev_button_click', {
      buttonLabel: prevButtonLabel,
    });
    router.back();
  };

  const handleClickNext = () => {
    trackEvent('problem_main_solve_footer_show_commentary_button_click');
    router.push(`/report/${publishId}/${problemId}/analysis`);
  };

  const handleClickSolveAgain = () => {
    trackEvent('problem_main_solve_check_modal_solve_again_button_click');
    closeModal();
  };

  const handleClickShowReport = () => {
    trackEvent('problem_main_solve_check_modal_commentary_button_click');
    router.push(`/report/${publishId}/${problemId}/analysis`);
  };

  // const handleClickCopyImage = async () => {
  //   if (!imageUrl) return;
  //   await copyImageToClipboard(imageUrl);
  // };

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
      <ProgressHeader progress={100} />
      <main className='flex flex-col px-[2rem] py-[8rem]'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-[1.2rem]'>
              <h1 className='font-bold-18 text-main'>메인 문제 {no}번</h1>
              <TimeTag minutes={minutes} seconds={seconds} />
            </div>
            {isSolved && (
              <Tag variant='green' sizeType='small'>
                정답
              </Tag>
            )}
            {status === 'INCORRECT' && (
              <Tag variant='red' sizeType='small'>
                오답
              </Tag>
            )}
          </div>
          <ImageContainer className='relative mt-[1.2rem]'>
            {/* <Image
              src={imageUrl ?? ''}
              alt={`메인 문제 ${no}번`}
              className='w-full object-contain'
              width={700}
              height={200}
              priority
            /> */}
            <ProblemViewer
              problemContent={problemContent}
              className='h-full w-full'
              width={700}
              height={200}
              loading={false}
            />
          </ImageContainer>

          {isDirect && (
            <div className='mt-[0.6rem] flex items-center justify-end'>
              <SmallButton variant='underline' sizeType='small' onClick={handleClickStepSolve}>
                단계별로 풀어보기
              </SmallButton>
            </div>
          )}

          {!isDirect && childProblems.length > 0 && (
            <div className='mt-[2.4rem] w-full'>
              <h3 className='font-bold-16 text-black'>새끼 문제 정답</h3>
              <div className='mt-[1.2rem] flex gap-[1.6rem]'>
                {childProblems.map((childProblem, index) => (
                  <div key={index} className='flex items-center gap-[0.6rem]'>
                    <span className='font-medium-16 text-black'>
                      {no}-{index + 1}번
                    </span>
                    <Tag variant={statusColor[childProblem.progress!]}>
                      {statusLabel[childProblem.progress!]}
                    </Tag>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='mt-[2.8rem] w-full'>
          <form onSubmit={handleSubmit(handleSubmitAnswer)}>
            <h3 className='font-bold-16 text-black'>정답 선택</h3>
            <div className='mt-[1.2rem] flex flex-col gap-[2rem] md:flex-row'>
              <AnswerInput
                answerType={answerType!}
                selectedAnswer={isSolved && answer ? String(answer) : selectedAnswer}
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
        onClickPrev={handleClickPrev}
        onClickNext={isSubmitted ? handleClickNext : undefined}
      />

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
