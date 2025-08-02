'use client';
import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { useGetProblemById, postProblemSubmit } from '@apis';
import {
  AnswerInput,
  Button,
  Tag,
  ProgressHeader,
  SmallButton,
  NavigationFooter,
  TimeTag,
  ImageContainer,
  MainAnswerCheckBottomSheetTemplate,
  BottomSheet,
  BottomFixedArea,
} from '@components';
import { useInvalidate, useModal } from '@hooks';
import { ProblemStatus } from '@types';
import { useChildProblemContext } from '@/hooks/problem';
import { copyImageToClipboard, showToast, trackEvent } from '@utils';
import { IcCommentCheck20, IcQuestion18, IcCopyBig } from '@svg';

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
  const problemViewerRef = useRef<HTMLDivElement>(null);

  const { data } = useGetProblemById({ publishId: +publishId, problemId: +problemId });

  const {
    no,
    childProblems = [],
    answerType,
    answer,
    problemContent,
    progress,
    recommendedTimeSec = 0,
  } = data ?? {};

  const seconds = recommendedTimeSec % 60;
  const minutes = Math.floor(recommendedTimeSec / 60);

  const isSolved = progress === 'CORRECT' || progress === 'SEMI_CORRECT';
  const isSubmitted =
    progress === 'CORRECT' || progress === 'SEMI_CORRECT' || progress === 'INCORRECT';
  const isDirect =
    childProblems.length > 0 && childProblems[childProblems.length - 1].progress === 'NONE';

  const prevButtonLabel =
    isDirect || childProblemLength === 0
      ? `메인 문제 ${no}번`
      : `새끼 문제 ${no}-${childProblemLength}번`;
  const nextButtonLabel = '해설 보기';

  const handleSubmitAnswer: SubmitHandler<{ answer: string }> = async ({ answer }) => {
    const { data } = await postProblemSubmit(+publishId, +problemId, null, +answer);
    if (!data) {
      showToast.error('정답 제출에 실패했습니다. 다시 시도해주세요.');
      return;
    }

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

  const handleClickCopyProblemImage = async () => {
    copyImageToClipboard(problemViewerRef);
  };

  const handleClickPointing = () => {
    trackEvent('problem_main_solve_pointing_button_click');
    invalidateAll();
    router.push(`/report/${publishId}/${problemId}/prescription/detail?type=main`);
  };

  const handleClickQuestion = () => {
    trackEvent('problem_main_solve_question_button_click');
    invalidateAll();
    router.push(`/qna/ask?publishId=${publishId}&problemId=${problemId}&type=PROBLEM_CONTENT`);
  };

  return (
    <>
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
            <ProblemViewer
              problem={problemContent}
              className='h-full w-full'
              width={700}
              height={200}
              loading={false}
            />
          </ImageContainer>
          <div className='mt-[1.2rem] mb-[0.4rem] flex items-center justify-end gap-[0.6rem]'>
            <SmallButton
              className='flex flex-row gap-[4px]'
              variant='white'
              sizeType='small'
              onClick={handleClickPointing}>
              <IcCommentCheck20 width={14} height={14} viewBox='0 0 20 20' />
              포인팅 보기
            </SmallButton>
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
                className='flex-1'
                answerType={answerType!}
                selectedAnswer={isSolved && answer ? String(answer) : selectedAnswer}
                disabled={isSolved}
                {...register('answer')}
              />
              <Button className='flex-1' disabled={isSolved}>
                제출하기
              </Button>
            </div>
          </form>
        </div>
      </main>
      <BottomFixedArea zIndex={10}>
        <NavigationFooter
          prevLabel={prevButtonLabel}
          nextLabel={isSubmitted ? nextButtonLabel : undefined}
          onClickPrev={handleClickPrev}
          onClickNext={isSubmitted ? handleClickNext : undefined}
        />
      </BottomFixedArea>

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
