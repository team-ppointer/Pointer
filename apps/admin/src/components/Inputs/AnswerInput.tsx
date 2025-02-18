import { Input } from '@components';
import { ProblemAnswerType } from '@types';
import { forwardRef } from 'react';

const AnswerTypeList = ['MULTIPLE_CHOICE', 'SHORT_STRING_ANSWER'];
const AnswerTypeName = {
  MULTIPLE_CHOICE: '객',
  SHORT_STRING_ANSWER: '주',
};

interface AnswerTypeSectionProps {
  selectedAnswerType: ProblemAnswerType | undefined;
}

interface AnswerInputSectionProps {
  selectedAnswerType: ProblemAnswerType | undefined;
  selectedAnswer: string | undefined;
}

const AnswerInput = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex w-full items-center gap-[2.4rem]'>{children}</div>;
};

const AnswerTypeSection = forwardRef<HTMLInputElement, AnswerTypeSectionProps>(
  ({ selectedAnswerType = 'MULTIPLE_CHOICE', ...props }, ref) => {
    return (
      <div className='flex gap-[0.8rem]'>
        {AnswerTypeList.map((answerType) => (
          <label key={answerType}>
            <input type='radio' className='hidden' ref={ref} value={answerType} {...props} />
            <div
              className={`flex h-[5.6rem] w-[5.6rem] cursor-pointer items-center justify-center rounded-[4px] ${answerType === selectedAnswerType ? 'bg-midgray200 text-white' : 'bg-lightgray300 text-lightgray500'} `}>
              <span className='font-medium-24'>
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
  ({ selectedAnswerType, selectedAnswer, ...props }, ref) => {
    return (
      <>
        {selectedAnswerType === 'SHORT_STRING_ANSWER' && <Input ref={ref} {...props} />}
        {selectedAnswerType === 'MULTIPLE_CHOICE' && (
          <div className='flex items-center justify-between gap-[1.6rem]'>
            {Array.from({ length: 5 }, (_, i) => (i + 1).toString()).map((num) => (
              <label key={num}>
                <input type='radio' className='hidden' value={num} ref={ref} {...props} />
                <div
                  className={`flex h-[5.6rem] w-[5.6rem] cursor-pointer items-center justify-center rounded-full ${
                    selectedAnswer === num
                      ? 'bg-darkgray100 text-white'
                      : 'border-lightgray500 border bg-white text-black'
                  }`}>
                  <span className='font-bold-24'>{num}</span>
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
