import { Input } from '@components';
import { ProblemAnswerType } from '@types';
import { forwardRef, InputHTMLAttributes } from 'react';

const AnswerTypeList = ['MULTIPLE_CHOICE', 'SHORT_ANSWER'];
const AnswerTypeName = {
  MULTIPLE_CHOICE: '객',
  SHORT_ANSWER: '주',
};

interface AnswerTypeSectionProps extends InputHTMLAttributes<HTMLInputElement> {
  selectedAnswerType: ProblemAnswerType | undefined;
}

interface AnswerInputSectionProps extends InputHTMLAttributes<HTMLInputElement> {
  selectedAnswerType: ProblemAnswerType | undefined;
  selectedAnswer: number | undefined;
  isError: boolean;
}

const AnswerInput = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex w-full items-center gap-[2.4rem]'>{children}</div>;
};

const AnswerTypeSection = forwardRef<HTMLInputElement, AnswerTypeSectionProps>(
  ({ selectedAnswerType, ...props }, ref) => {
    return (
      <div className='flex gap-200'>
        {AnswerTypeList.map((answerType) => (
          <label key={answerType}>
            <input
              type='radio'
              className='hidden'
              ref={ref}
              value={answerType}
              checked={answerType === selectedAnswerType}
              {...props}
            />
            <div
              className={`rounded-200 flex h-[5.6rem] w-[5.6rem] cursor-pointer items-center justify-center ${answerType === selectedAnswerType ? 'bg-midgray200 text-white' : 'bg-lightgray300 text-lightgray500'} `}>
              <span className='font-medium-18'>
                {AnswerTypeName[answerType as ProblemAnswerType]}
              </span>
            </div>
          </label>
        ))}
      </div>
    );
  }
);

const AnswerInputSection = forwardRef<HTMLInputElement, AnswerInputSectionProps>(
  ({ selectedAnswerType, selectedAnswer, isError, ...props }, ref) => {
    return (
      <>
        {selectedAnswerType === 'SHORT_ANSWER' && (
          <Input ref={ref} {...props} className={`${isError ? 'border-red' : ''}`} type='number' />
        )}
        {selectedAnswerType === 'MULTIPLE_CHOICE' && (
          <div className='flex items-center justify-between gap-200'>
            {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
              <label key={num}>
                <input
                  type='radio'
                  className='hidden'
                  value={num}
                  ref={ref}
                  checked={Number(selectedAnswer) === num}
                  {...props}
                />
                <div
                  className={`flex h-[5.6rem] w-[5.6rem] cursor-pointer items-center justify-center rounded-full ${
                    Number(selectedAnswer) === num
                      ? 'bg-darkgray100 text-white'
                      : 'border-lightgray500 border bg-white text-black'
                  } ${isError ? 'border-red' : ''}`}>
                  <span className='font-bold-18'>{num}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </>
    );
  }
);

AnswerInput.AnswerTypeSection = AnswerTypeSection;
AnswerInput.AnswerInputSection = AnswerInputSection;

export default AnswerInput;
