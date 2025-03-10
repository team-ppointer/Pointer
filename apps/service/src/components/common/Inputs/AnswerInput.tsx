import { Input } from '@components';
import { ProblemAnswerType } from '@types';
import { forwardRef } from 'react';

interface AnswerInputProps {
  answerType: ProblemAnswerType;
  selectedAnswer: string;
}

const AnswerInput = forwardRef<HTMLInputElement, AnswerInputProps>(
  ({ answerType, selectedAnswer, ...props }, ref) => {
    return (
      <>
        {answerType === 'SHORT_ANSWER' && <Input ref={ref} placeholder='입력해주세요' {...props} />}
        {answerType === 'MULTIPLE_CHOICE' && (
          <div className='flex items-center justify-between'>
            {Array.from({ length: 5 }, (_, i) => (i + 1).toString()).map((num) => (
              <label key={num}>
                <input type='radio' className='hidden' value={num} ref={ref} {...props} />
                <div
                  className={`font-medium-24 flex h-[5.6rem] w-[5.6rem] cursor-pointer items-center justify-center rounded-[16px] bg-white ${
                    selectedAnswer === num && 'border-main border'
                  }`}>
                  {num}
                </div>
              </label>
            ))}
          </div>
        )}
      </>
    );
  }
);

export default AnswerInput;
