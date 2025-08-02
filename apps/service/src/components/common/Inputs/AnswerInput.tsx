import { forwardRef } from 'react';

import { Input } from '@components';
import { ProblemAnswerType } from '@types';

interface AnswerInputProps {
  answerType: ProblemAnswerType;
  selectedAnswer: string;
  disabled?: boolean;
  className?: string;
}

const AnswerInput = forwardRef<HTMLInputElement, AnswerInputProps>(
  ({ answerType, selectedAnswer, disabled = false, className, ...props }, ref) => {
    return (
      <div className={className}>
        {answerType === 'SHORT_ANSWER' && (
          <Input
            ref={ref}
            placeholder='입력해주세요'
            type='number'
            disabled={disabled}
            {...props}
          />
        )}
        {answerType === 'MULTIPLE_CHOICE' && (
          <div className='flex items-center justify-between gap-[1.4rem]'>
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
      </div>
    );
  }
);

AnswerInput.displayName = 'AnswerInput';

export default AnswerInput;
