import { forwardRef } from 'react';

import { Input } from '@components';
import { ProblemAnswerType } from '@types';

interface AnswerInputProps {
  answerType: ProblemAnswerType;
  selectedAnswer: string;
  disabled?: boolean;
}

const AnswerInput = forwardRef<HTMLInputElement, AnswerInputProps>(
  ({ answerType, selectedAnswer, disabled = false, ...props }, ref) => {
    return (
      <>
        {answerType === 'SHORT_ANSWER' && (
          <Input ref={ref} placeholder='입력해주세요' disabled={disabled} {...props} />
        )}
        {answerType === 'MULTIPLE_CHOICE' && (
          <div className='flex items-center gap-[1.4rem]'>
            {Array.from({ length: 5 }, (_, i) => (i + 1).toString()).map((num) => (
              <label key={num}>
                <input
                  type='radio'
                  className='hidden'
                  value={num}
                  ref={ref}
                  disabled={disabled}
                  {...props}
                />
                <div
                  className={`font-medium-24 flex h-[5.6rem] w-[5.6rem] ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'} items-center justify-center rounded-[16px] bg-white ${
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

AnswerInput.displayName = 'AnswerInput';

export default AnswerInput;
