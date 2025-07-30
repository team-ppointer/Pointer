'use client';
import { useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { copyImageToClipboard, showToast } from '@utils';
import { useGetChildProblemTeacherById } from '@apis';
import {
  NavigationFooter,
  ProgressHeader,
  SmallButton,
  Tag,
  ImageContainer,
  BottomFixedArea,
} from '@components';
import { useChildProblemContext } from '@/hooks/problem';
import { trackEvent } from '@utils';
import { IcCopyBig, IcRotate } from '@svg';
import { AnswerLabel } from '@/components/problem';

const Page = () => {
  const { publishId, problemId, childProblemId, studentId } = useParams<{
    publishId: string;
    problemId: string;
    childProblemId: string;
    studentId: string;
  }>();
  const router = useRouter();
  const { childProblemLength, onPrev, onNext } = useChildProblemContext();

  const problemViewerRef = useRef<HTMLDivElement>(null);

  // apis

  const { data, isLoading } = useGetChildProblemTeacherById(
    +publishId,
    +childProblemId,
    +studentId
  );
  console.log('data', data);
  const { id, problemNo, no = 1, problemContent, progress, submitAnswer, answer } = data ?? {};

  const prevButtonLabel = no === 1 ? '' : `새끼 문제 ${problemNo}-${no - 1}번`;

  const nextButtonLabel =
    no === childProblemLength ? `메인 문제 ${problemNo}번` : `새끼 문제 ${problemNo}-${no + 1}번`;

  const isSolved = progress === 'CORRECT' || progress === 'SEMI_CORRECT';

  const handleClickShowMainProblem = () => {
    trackEvent('problem_child_solve_show_main_problem_modal_button_click');
    router.push(
      `/image-modal?publishId=${publishId}&childProblemId=${childProblemId}&studentId=${studentId}`
    );
  };

  const handleClickPrev = () => {
    trackEvent('problem_child_solve_footer_prev_button_click', {
      buttonLabel: prevButtonLabel,
    });
    onPrev();
  };

  const handleClickNext = () => {
    trackEvent('problem_child_solve_footer_next_button_click', {
      buttonLabel: nextButtonLabel,
    });
    onNext();
  };

  const handleClickCopyProblemImage = async () => {
    copyImageToClipboard(problemViewerRef);
    showToast.success('클립보드에 복사되었습니다.');
  };

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <ProgressHeader progress={(no / childProblemLength) * 100} />
      <main className='flex h-full flex-col px-[2rem] py-[8rem]'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <h1 className='font-bold-18 text-main'>
              새끼 문제 {problemNo}-{no}번
            </h1>
          </div>
          <ImageContainer className='relative mt-[1.2rem]' ref={problemViewerRef}>
            <ProblemViewer problem={problemContent} loading={false} />
          </ImageContainer>
          <div className='mt-[1.2rem] mb-[0.4rem] flex items-center justify-end gap-[0.6rem]'>
            <SmallButton
              className='flex flex-row gap-[4px]'
              variant='white'
              sizeType='small'
              onClick={handleClickShowMainProblem}>
              <IcRotate width={14} height={14} />
              메인 문제 다시보기
            </SmallButton>
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
      </main>

      <BottomFixedArea>
        <div className='mx-[2rem] flex flex-row gap-[0.8rem]'>
          <AnswerLabel label='학생 답' value={submitAnswer} />
          <AnswerLabel label='문제 정답' value={answer} />
        </div>
        <NavigationFooter
          prevLabel={prevButtonLabel}
          nextLabel={nextButtonLabel}
          onClickPrev={handleClickPrev}
          onClickNext={handleClickNext}
        />
      </BottomFixedArea>
    </>
  );
};

export default Page;
