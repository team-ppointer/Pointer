'use client';
import { putProblemSubmit } from '@apis';
import { AnswerInput, Button } from '@components';
import { ProblemAnswerType } from '@types';
import { SubmitHandler, useForm } from 'react-hook-form';

interface AnswerInputFormProps {
  publishId: string;
  problemId: string;
  childProblemId?: string;
  answerType?: ProblemAnswerType;
}

interface AnswerType {
  answer: string;
}

const AnswerInputForm = ({
  publishId,
  problemId,
  answerType = 'MULTIPLE_CHOICE',
  childProblemId,
}: AnswerInputFormProps) => {
  const { register, handleSubmit, watch } = useForm<AnswerType>();
  const selectedAnswer = watch('answer');

  const onSubmitAnswer: SubmitHandler<AnswerType> = (data) => {
    if (childProblemId) {
      console.log(data);
    } else {
      putProblemSubmit(publishId, problemId, data.answer);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitAnswer)}>
      <h3 className='font-bold-16 text-black'>정답 선택</h3>
      <div className='mt-[1.2rem] flex flex-col gap-[2rem] lg:flex-row'>
        <AnswerInput
          answerType={answerType}
          selectedAnswer={selectedAnswer}
          {...register('answer')}
        />
        <Button>제출하기</Button>
      </div>
    </form>
  );
};

export default AnswerInputForm;
