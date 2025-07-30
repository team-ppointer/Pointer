'use client';
import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { copyImageToClipboard, showToast } from '@utils';
import { postProblemSubmit, useGetChildProblemById } from '@apis';
import {
  AnswerInput,
  Button,
  PortalModal,
  NavigationFooter,
  ProgressHeader,
  SmallButton,
  TwoButtonModalTemplate,
  AnswerModalTemplate,
  Tag,
  ImageContainer,
  BottomSheet,
  ChildAnswerCheckBottomSheetTemplate,
  BottomFixedArea,
} from '@components';
import { useInvalidate, useModal } from '@hooks';
import { useChildProblemContext } from '@/hooks/problem';
import { trackEvent } from '@utils';
import { IcCommentCheck20, IcCopyBig, IcQuestion18, IcRotate } from '@svg';
import { ProblemStatus } from '@/types/component';

const Page = () => {
  const { publishId, problemId, childProblemId } = useParams<{
    publishId: string;
    problemId: string;
    childProblemId: string;
  }>();
  const router = useRouter();
  const { childProblemLength, onPrev, onNext } = useChildProblemContext();
  const { invalidateAll } = useInvalidate();

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isAnswerModalOpen,
    openModal: openAnswerModal,
    closeModal: closeAnswerModal,
  } = useModal();
  const {
    isOpen: isSkipModalOpen,
    openModal: openSkipModal,
    closeModal: closeSkipModal,
  } = useModal();

  const [result, setResult] = useState<ProblemStatus | undefined>();
  const { register, handleSubmit, watch } = useForm<{ answer: string }>();
  const selectedAnswer = watch('answer');
  const problemViewerRef = useRef<HTMLDivElement>(null);

  // apis
  const { data, isLoading } = useGetChildProblemById(+publishId, +childProblemId);
  const {
    problemNo,
    no = 1,
    problemContent,
    answerType = 'MULTIPLE_CHOICE',
    answer,
    progress,
  } = data ?? {};

  const prevButtonLabel = no === 1 ? '' : `새끼 문제 ${problemNo}-${no - 1}번`;

  const nextButtonLabel =
    no === childProblemLength ? `메인 문제 ${problemNo}번` : `새끼 문제 ${problemNo}-${no + 1}번`;

  const isSolved = progress === 'CORRECT' || progress === 'SEMI_CORRECT';
  const isSubmitted =
    progress === 'CORRECT' || progress === 'SEMI_CORRECT' || progress === 'INCORRECT';

  const handleClickShowMainProblem = () => {
    trackEvent('problem_child_solve_show_main_problem_modal_button_click');
    router.push(`/image-modal?publishId=${publishId}&childProblemId=${childProblemId}`);
  };

  const handleSubmitAnswer: SubmitHandler<{ answer: string }> = async ({ answer }) => {
    const { data } = await postProblemSubmit(+publishId, null, +childProblemId, +answer);
    const resultData = data?.progress;
    invalidateAll();

    setResult(resultData);
    if (resultData) {
      openModal();
    }
  };

  const handleClickPrev = () => {
    trackEvent('problem_child_solve_footer_prev_button_click', {
      buttonLabel: prevButtonLabel,
    });
    onPrev();
  };

  const handleClickNext = () => {
    console.log('childProblemLength', childProblemLength);
    console.log('no', no);
    trackEvent('problem_child_solve_footer_next_button_click', {
      buttonLabel: nextButtonLabel,
    });
    if (childProblemLength === no) {
      router.push(`/problem/solve/${publishId}/${problemId}/main-problem`);
      return;
    }
    onNext();
  };

  const handleClickFooterSkipButton = () => {
    trackEvent('problem_child_solve_footer_skip_button_click', {
      buttonLabel: nextButtonLabel,
    });
    openSkipModal();
  };

  const handleClickCloseCheckModal = () => {
    trackEvent('problem_child_solve_check_modal_close_button_click');
    closeModal();
  };

  const handleClickShowAnswer = () => {
    trackEvent('problem_child_solve_check_modal_show_answer_button_click');
    closeModal();
    openAnswerModal();
  };
  const handleClickCloseSkipModal = () => {
    trackEvent('problem_child_solve_skip_modal_close_button_click');
    closeSkipModal();
  };

  const handleClickSkipButton = async () => {
    trackEvent('problem_child_solve_modal_skip_button_click');
    await postProblemSubmit(+publishId, null, +childProblemId, null);
    invalidateAll();
    onNext();
  };

  const handleClickPointing = () => {
    trackEvent('problem_child_solve_pointing_button_click');
    invalidateAll();
    router.push(
      `/report/${publishId}/${problemId}/prescription/detail?type=child&childNumber=${no}`
    );
  };
  const handleClickQuestion = () => {
    trackEvent('problem_child_solve_question_button_click');
    invalidateAll();
    router.push(
      `/qna/ask?publishId=${publishId}&childProblemId=${childProblemId}&type=CHILD_PROBLEM_CONTENT`
    );
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
      <ProgressHeader progress={(no / (childProblemLength + 1)) * 100} />
      <main className='flex flex-col px-[2rem] py-[8rem]'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <h1 className='font-bold-18 text-main'>
              새끼 문제 {problemNo}-{no}번
            </h1>
            {isSolved && (
              <Tag variant='green' sizeType='medium'>
                정답
              </Tag>
            )}
            {progress === 'INCORRECT' && (
              <Tag variant='red' sizeType='medium'>
                오답
              </Tag>
            )}
            {progress === 'NONE' && <Tag sizeType='medium'>미완</Tag>}
          </div>
          <ImageContainer className='relative mt-[1.2rem]' ref={problemViewerRef}>
            <ProblemViewer problem={problemContent} loading={false} />
          </ImageContainer>
          <div className='mt-[0.6rem] mb-[0.4rem] flex items-center justify-end gap-[0.6rem]'>
            <SmallButton
              className='flex flex-row gap-[4px]'
              variant='white'
              sizeType='small'
              onClick={handleClickPointing}>
              <IcCommentCheck20 width={14} height={14} viewBox='0 0 20 20' />
              포인팅 보기
            </SmallButton>
            <SmallButton
              className='flex flex-row gap-[4px]'
              variant='white'
              sizeType='small'
              onClick={handleClickShowMainProblem}>
              <IcRotate width={14} height={14} />
              메인 문제 다시보기
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
        </div>

        <div className='w-full'>
          <form onSubmit={handleSubmit(handleSubmitAnswer)}>
            <h3 className='font-bold-16 text-black'>정답 선택</h3>
            <div className='mt-[1.2rem] flex flex-col gap-[2rem]'>
              <AnswerInput
                answerType={answerType}
                selectedAnswer={isSolved && answer ? String(answer) : selectedAnswer}
                disabled={isSolved}
                {...register('answer')}
              />
              <Button disabled={isSolved}>제출하기</Button>
            </div>
          </form>
        </div>
      </main>
      <BottomFixedArea zIndex={10}>
        <NavigationFooter
          prevLabel={prevButtonLabel}
          nextLabel={nextButtonLabel}
          onClickPrev={handleClickPrev}
          onClickNext={isSubmitted ? handleClickNext : handleClickFooterSkipButton}
        />
      </BottomFixedArea>

      <BottomSheet isOpen={isOpen} onClose={closeModal}>
        <ChildAnswerCheckBottomSheetTemplate
          result={result}
          onClose={handleClickCloseCheckModal}
          handleClickShowPointing={handleClickPointing}
          handleClickNext={handleClickNext}
          handleClickShowAnswer={handleClickShowAnswer}
        />
      </BottomSheet>

      <PortalModal isOpen={isAnswerModalOpen} onClose={closeAnswerModal}>
        <AnswerModalTemplate
          answer={`${answer}${answerType === 'MULTIPLE_CHOICE' ? '번' : ''}`}
          handleClickButton={closeAnswerModal}
        />
      </PortalModal>
      <PortalModal isOpen={isSkipModalOpen} onClose={closeSkipModal}>
        <TwoButtonModalTemplate
          text={`제출하지 않은 새끼 문제는\n오답 처리 돼요!`}
          topButtonText='다시 풀어보기'
          bottomButtonText='오답 처리 하고 넘어가기'
          handleClickTopButton={handleClickCloseSkipModal}
          handleClickBottomButton={handleClickSkipButton}
        />
      </PortalModal>
    </>
  );
};

export default Page;
