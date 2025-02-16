import { ProblemAnswerType } from '@types';

interface ProblemAnswerTypeButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

interface NumberProps {
  label: number;
  isSelected: boolean;
  onClick: () => void;
}

interface AnswerInputProps {
  problemAnswerType: ProblemAnswerType;
  answer: string | null;
  handleClickProblemAnswerType: (type: ProblemAnswerType) => void;
  handleChangeAnswer: (value: string) => void;
}

const ProblemAnswerTypeButton = ({ label, isSelected, onClick }: ProblemAnswerTypeButtonProps) => {
  const selectedStyle = isSelected
    ? 'bg-midgray200 text-white'
    : 'bg-lightgray300 text-lightgray500';

  return (
    <div
      className={`font-medium-24 flex h-[5.6rem] w-[5.6rem] items-center justify-center ${selectedStyle} cursor-pointer rounded-[4px]`}
      onClick={onClick}>
      {label}
    </div>
  );
};

const Input = () => {
  return (
    <input
      className='placeholder:text-lightgray500 font-bold-24 border-lightgray500 h-[5.6rem] w-full rounded-[16px] border bg-white px-[1.6rem] text-black'
      placeholder='입력해주세요'
    />
  );
};

const Number = ({ label, isSelected, onClick }: NumberProps) => {
  const selectedStyle = isSelected
    ? 'bg-darkgray100 text-white'
    : 'bg-white text-black border border-lightgray500';

  return (
    <div
      className={`font-bold-24 flex h-[5.6rem] w-[5.6rem] cursor-pointer items-center justify-center rounded-full ${selectedStyle}`}
      onClick={onClick}>
      {label}
    </div>
  );
};

const AnswerInput = ({
  problemAnswerType,
  answer,
  handleClickProblemAnswerType,
  handleChangeAnswer,
}: AnswerInputProps) => {
  return (
    <div className='flex min-w-[44rem] gap-[2.4rem]'>
      <div className='flex gap-[0.8rem]'>
        <ProblemAnswerTypeButton
          label='객'
          isSelected={problemAnswerType === 'MULTIPLE_CHOICE'}
          onClick={() => handleClickProblemAnswerType('MULTIPLE_CHOICE')}
        />
        <ProblemAnswerTypeButton
          label='주'
          isSelected={problemAnswerType === 'SINGLE_CHOICE'}
          onClick={() => handleClickProblemAnswerType('SINGLE_CHOICE')}
        />
      </div>
      {problemAnswerType === 'SINGLE_CHOICE' && <Input />}
      {problemAnswerType === 'MULTIPLE_CHOICE' && (
        <div className='flex items-center justify-between gap-[1.6rem]'>
          {[1, 2, 3, 4, 5].map((num) => (
            <Number
              key={num}
              label={num}
              isSelected={answer === num.toString()}
              onClick={() => handleChangeAnswer(num.toString())}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnswerInput;
