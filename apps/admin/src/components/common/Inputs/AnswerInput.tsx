import { Input } from '@components';
import { ProblemAnswerType } from '@types';
import { InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

const AnswerTypeList = ['MULTIPLE_CHOICE', 'SHORT_ANSWER'];
const AnswerTypeName = {
  MULTIPLE_CHOICE: '객',
  SHORT_ANSWER: '주',
};

interface AnswerTypeSectionProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  selectedAnswerType: ProblemAnswerType | undefined;
  registration: UseFormRegisterReturn;
}

interface AnswerInputSectionProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  selectedAnswerType: ProblemAnswerType | undefined;
  selectedAnswer: number | undefined;
  isError: boolean;
  registration: UseFormRegisterReturn;
}

const AnswerInput = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex w-full items-center gap-[2.4rem]'>{children}</div>;
};

const AnswerTypeSection = ({
  selectedAnswerType,
  registration,
  ...props
}: AnswerTypeSectionProps) => {
  return (
    <div className='flex gap-200'>
      {AnswerTypeList.map((answerType) => (
        <label key={answerType}>
          <input
            type='radio'
            className='hidden'
            name={registration.name}
            value={answerType}
            checked={answerType === selectedAnswerType}
            onChange={registration.onChange}
            onBlur={registration.onBlur}
            ref={(el) => registration.ref(el)}
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
};

const AnswerInputSection = ({
  selectedAnswerType,
  selectedAnswer,
  isError,
  registration,
  ...props
}: AnswerInputSectionProps) => {
  return (
    <>
      {selectedAnswerType === 'SHORT_ANSWER' && (
        <Input
          name={registration.name}
          onChange={registration.onChange}
          onBlur={registration.onBlur}
          ref={(el) => registration.ref(el)}
          {...props}
          className={`${isError ? 'border-red' : ''}`}
          type='number'
        />
      )}
      {selectedAnswerType === 'MULTIPLE_CHOICE' && (
        <div className='flex items-center justify-between gap-200'>
          {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
            <label key={num}>
              <input
                type='radio'
                className='hidden'
                name={registration.name}
                value={num}
                checked={Number(selectedAnswer) === num}
                onChange={registration.onChange}
                onBlur={registration.onBlur}
                ref={(el) => registration.ref(el)}
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
};

AnswerInput.AnswerTypeSection = AnswerTypeSection;
AnswerInput.AnswerInputSection = AnswerInputSection;

export default AnswerInput;
