import { Input, SegmentedControl } from '@components';
import { ProblemAnswerType } from '@types';
import { ChangeEvent, InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

const AnswerTypeList = ['MULTIPLE_CHOICE', 'SHORT_ANSWER'];
const AnswerTypeName = {
  MULTIPLE_CHOICE: '객관식',
  SHORT_ANSWER: '주관식',
};

interface AnswerTypeSectionProps extends Pick<InputHTMLAttributes<HTMLInputElement>, 'disabled'> {
  selectedAnswerType: ProblemAnswerType | undefined;
  onChange: (value: ProblemAnswerType) => void;
}

interface AnswerInputSectionProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  selectedAnswerType: ProblemAnswerType | undefined;
  selectedAnswer: number | undefined;
  isError: boolean;
  registration: UseFormRegisterReturn;
}

const AnswerInput = ({ children }: { children: React.ReactNode }) => {
  return <div className='flex w-full items-center gap-6'>{children}</div>;
};

const AnswerTypeSection = ({ selectedAnswerType, onChange, disabled }: AnswerTypeSectionProps) => {
  const handleChange = (nextValue: string) => {
    onChange(nextValue as ProblemAnswerType);
  };

  return (
    <>
      <SegmentedControl
        value={selectedAnswerType}
        onChange={handleChange}
        className={disabled ? 'pointer-events-none opacity-60' : undefined}
        items={AnswerTypeList.map((answerType) => ({
          label: AnswerTypeName[answerType as ProblemAnswerType],
          value: answerType,
        }))}
      />
    </>
  );
};

const AnswerInputSection = ({
  selectedAnswerType,
  selectedAnswer,
  isError,
  registration,
  ...props
}: AnswerInputSectionProps) => {
  const handleMultipleChoiceChange = (nextValue: string) => {
    if (!registration?.onChange) return;
    const syntheticEvent = {
      target: {
        name: registration.name,
        value: nextValue,
      },
      type: 'change',
    } as unknown as ChangeEvent<HTMLInputElement>;
    registration.onChange(syntheticEvent);
  };

  return (
    <>
      {selectedAnswerType === 'SHORT_ANSWER' && (
        <Input
          name={registration.name}
          onChange={registration.onChange}
          onBlur={registration.onBlur}
          ref={(el) => registration.ref(el)}
          {...props}
          className={`${isError ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`}
          type='number'
          placeholder='답안 입력'
        />
      )}
      {selectedAnswerType === 'MULTIPLE_CHOICE' && (
        <div className='flex flex-col gap-3'>
          <SegmentedControl
            value={selectedAnswer != null ? String(selectedAnswer) : undefined}
            onChange={handleMultipleChoiceChange}
            enabled={!props.disabled}
            className={`max-w-full ${isError ? 'ring-2 ring-red-200 ring-offset-2' : ''}`}
            items={Array.from({ length: 5 }, (_, i) => {
              const value = String(i + 1);
              return { label: value, value };
            })}
          />
          <input
            type='hidden'
            name={registration.name}
            value={selectedAnswer != null ? String(selectedAnswer) : ''}
            readOnly
            disabled={props.disabled}
            ref={(el) => registration.ref(el)}
          />
        </div>
      )}
    </>
  );
};

AnswerInput.AnswerTypeSection = AnswerTypeSection;
AnswerInput.AnswerInputSection = AnswerInputSection;

export default AnswerInput;
