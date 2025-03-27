'use client';
import { putProblemSubmit } from '@apis';
import { AnswerInput, Button, AnswerCheckModalTemplate, PortalModal } from '@components';
import { useModal } from '@hooks';
import { ProblemAnswerType, ProblemStatus } from '@types';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface AnswerInputFormProps {
  publishId: string;
  problemId: string;
  childProblemId?: string;
  answerType?: ProblemAnswerType;
  isSolved: boolean;
}

interface AnswerType {
  answer: string;
}

const AnswerInputForm = ({
  publishId,
  problemId,
  answerType = 'MULTIPLE_CHOICE',
  childProblemId,
  isSolved,
}: AnswerInputFormProps) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [result, setResult] = useState<ProblemStatus | undefined>();
  const { register, handleSubmit, watch } = useForm<AnswerType>();
  const selectedAnswer = watch('answer');

  const onSubmitAnswer: SubmitHandler<AnswerType> = async (data) => {
    if (childProblemId) {
    } else {
      const { data: resultData } = await putProblemSubmit(publishId, problemId, data.answer);
      setResult(resultData?.data);
      if (resultData) {
        openModal();
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitAnswer)}>
        <h3 className='font-bold-16 text-black'>정답 선택</h3>
        <div className='mt-[1.2rem] flex flex-col gap-[2rem] lg:flex-row'>
          <AnswerInput
            answerType={answerType}
            selectedAnswer={selectedAnswer}
            disabled={isSolved}
            {...register('answer')}
          />
          <Button disabled={isSolved}>제출하기</Button>
        </div>
      </form>
      <PortalModal isOpen={isOpen} onClose={closeModal}>
        <AnswerCheckModalTemplate result={result} onClose={closeModal} />
      </PortalModal>
    </>
  );
};

export default AnswerInputForm;
