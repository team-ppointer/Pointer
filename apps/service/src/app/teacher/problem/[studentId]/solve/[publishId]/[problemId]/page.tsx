'use client';
import { useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { useGetProblemTeacherById } from '@apis';
import {
  ProgressHeader,
  SmallButton,
  TimeTag,
  ImageContainer,
  NavigationFooter,
  BottomFixedArea,
} from '@components';
import { useInvalidate } from '@hooks';
import { useChildProblemContext } from '@/hooks/problem';
import { copyImageToClipboard, showToast, trackEvent } from '@utils';
import { IcArrowGrow14, IcCopyBig } from '@svg';
import AnswerLabel from '@/components/problem/AnswerLabel';

const Page = () => {
  const { publishId, problemId, studentId } = useParams<{
    publishId: string;
    problemId: string;
    studentId: string;
  }>();
  const router = useRouter();
  const { childProblemLength } = useChildProblemContext();
  const { invalidateAll } = useInvalidate();
  const problemViewerRef = useRef<HTMLDivElement>(null);

  const { data: problemData } = useGetProblemTeacherById({
    publishId: +publishId,
    problemId: +problemId,
    studentId: +studentId,
  });

  if (!problemData) {
    return;
  }
  const { no, recommendedTimeSec, problemContent, childProblems, submitAnswer, answer } =
    problemData;
  const childProblemId = childProblems[0]?.id || 0;

  const hasChildProblem = childProblemLength > 0;

  const seconds = recommendedTimeSec % 60;
  const minutes = Math.floor(recommendedTimeSec / 60);

  const handleClickStepSolve = async () => {
    trackEvent('problem_main_solve_step_solve_button_click');
    invalidateAll();
    router.push(
      `/teacher/problem/${studentId}/solve/${publishId}/${problemId}/child-problem/${childProblemId}`
    );
  };

  const handleClickCopyProblemImage = async () => {
    copyImageToClipboard(problemViewerRef);
    showToast.success('클립보드에 복사되었습니다.');
  };

  const handleClickNext = () => {
    trackEvent('problem_main_solve_footer_next_button_click');
    if (childProblemLength < 0) {
      return;
    }
    router.push(
      `/teacher/problem/${studentId}/solve/${publishId}/${problemId}/child-problem/${childProblemId}`
    );
  };

  return (
    <>
      <ProgressHeader />
      <main className='mb-[7rem] flex h-full flex-col px-[2rem] py-[8rem]'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center justify-between gap-[1.2rem]'>
              <h1 className='font-bold-18 text-main'>메인 문제 {no}번</h1>
              <TimeTag minutes={minutes} seconds={seconds} />
            </div>
          </div>
          <ImageContainer className='relative mt-[1.2rem]' ref={problemViewerRef}>
            <ProblemViewer problem={problemContent} loading={false} />
          </ImageContainer>

          {hasChildProblem && (
            <div className='tems-center right-0 mt-[0.6rem] flex items-end justify-end'>
              <div className='mt-[0.6rem] flex items-center justify-end gap-[0.8rem]'>
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
        <BottomFixedArea>
          <div className='mx-[2rem] flex flex-row gap-[0.8rem]'>
            <AnswerLabel label='학생 답' value={submitAnswer} />
            <AnswerLabel label='문제 정답' value={answer} />
          </div>
          <NavigationFooter
            prevLabel={'문제 리스트'}
            nextLabel={childProblemLength > 0 ? '새끼 문제 1-1번' : ''}
            onClickPrev={() => {
              router.back();
            }}
            onClickNext={handleClickNext}
          />
        </BottomFixedArea>
      </main>
    </>
  );
};

export default Page;
