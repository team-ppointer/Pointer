'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import { Slide, ToastContainer } from 'react-toastify';

import { copyImageToClipboard } from '@utils';
import { useGetChildProblemById } from '@apis';
import { putChildProblemSubmit, putChildProblemSkip } from '@apis';
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
  CopyButton,
  BottomSheet,
  ChildAnswerCheckBottomSheetTemplate,
} from '@components';
import { useInvalidate, useModal } from '@hooks';
import { components } from '@schema';
import { useChildProblemContext } from '@/hooks/problem';
import { trackEvent } from '@utils';

type ChildProblemSubmitUpdateResponse = components['schemas']['ChildProblemSubmitUpdateResponse'];

const Page = () => {
  const { publishId, problemId, childProblemId } = useParams<{
    publishId: string;
    problemId: string;
    childProblemId: string;
  }>();
  const router = useRouter();
  const { childProblemLength, mainProblemImageUrl, onPrev, onNext } = useChildProblemContext();
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

  const [result, setResult] = useState<ChildProblemSubmitUpdateResponse | undefined>();
  const { register, handleSubmit, watch } = useForm<{ answer: string }>();
  const selectedAnswer = watch('answer');

  // apis
  const { data, isLoading } = useGetChildProblemById(publishId, problemId, childProblemId);
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
  const isSubmitted = status === 'CORRECT' || status === 'RETRY_CORRECT' || status === 'INCORRECT';

  const handleClickShowMainProblem = () => {
    trackEvent('problem_child_solve_show_main_problem_modal_button_click');
    router.push(`/image-modal?imageUrl=${mainProblemImageUrl}`);
  };

  const handleSubmitAnswer: SubmitHandler<{ answer: string }> = async ({ answer }) => {
    const { data } = await putChildProblemSubmit(publishId, childProblemId, answer);
    const resultData = data?.data;
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
    trackEvent('problem_child_solve_footer_next_button_click', {
      buttonLabel: nextButtonLabel,
    });
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

  const handleClickNextProblemButton = () => {
    trackEvent('problem_child_solve_check_modal_next_problem_button_click');
    onNext();
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
    await putChildProblemSkip(publishId, childProblemId);
    invalidateAll();
    onNext();
  };

  const handleClickCopyImage = async () => {
    if (!imageUrl) return;
    await copyImageToClipboard(imageUrl);
  };

  if (isLoading) {
    return <></>;
  }

  return (
    <>
      <ToastContainer
        position='top-center'
        autoClose={1000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover={false}
        hideProgressBar
        transition={Slide}
        style={{
          fontSize: '1.6rem',
        }}
      />
      <ProgressHeader progress={(childProblemNumber / (childProblemLength + 1)) * 100} />
      <main className='flex flex-col px-[2rem] py-[8rem]'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <h1 className='font-bold-18 text-main'>
              새끼 문제 {problemNumber}-{childProblemNumber}번
            </h1>
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
            <Image
              src={imageUrl ?? ''}
              alt={`새끼 문제 ${problemNumber}-${childProblemNumber}번`}
              className='w-full object-contain'
              width={700}
              height={200}
              priority
            />
            <div className='absolute right-[1.6rem] bottom-[1.6rem]'>
              <CopyButton onClick={handleClickCopyImage} />
            </div>
          </ImageContainer>

          <div className='mt-[0.6rem] mb-[0.4rem] flex items-center justify-end'>
            <SmallButton variant='underline' sizeType='small' onClick={handleClickShowMainProblem}>
              메인 문제 다시보기
            </SmallButton>
          </div>
        </div>

        <div className='w-full'>
          <form onSubmit={handleSubmit(handleSubmitAnswer)}>
            <h3 className='font-bold-16 text-black'>정답 선택</h3>
            <div className='mt-[1.2rem] flex flex-col gap-[2rem]'>
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
        onClickPrev={handleClickPrev}
        onClickNext={isSubmitted ? handleClickNext : handleClickFooterSkipButton}
      />

      <BottomSheet isOpen={isOpen} onClose={closeModal}>
        <ChildAnswerCheckBottomSheetTemplate
          result={result}
          onClose={handleClickCloseCheckModal}
          handleClickShowPointing={() => {}}
          handleClickNext={handleClickNextProblemButton}
          handleClickShowAnswer={handleClickShowAnswer}
        />
      </BottomSheet>

      <PortalModal isOpen={isAnswerModalOpen} onClose={closeAnswerModal}>
        <AnswerModalTemplate
          answer={`${result?.answer}${answerType === 'MULTIPLE_CHOICE' ? '번' : ''}`}
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
