import { ProblemType } from '@types';

interface ProblemTypeButtonProps {
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
  problemType: ProblemType;
  answer: string | null;
  handleClickProblemType: (type: ProblemType) => void;
  handleChangeAnswer: (value: string) => void;
}

const ProblemTypeButton = ({ label, isSelected, onClick }: ProblemTypeButtonProps) => {
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
  problemType,
  answer,
  handleClickProblemType,
  handleChangeAnswer,
}: AnswerInputProps) => {
  return (
    <div className='flex min-w-[44rem] gap-[2.4rem]'>
      <div className='flex gap-[0.8rem]'>
        <ProblemTypeButton
          label='객'
          isSelected={problemType === 'MULTIPLE_CHOICE'}
          onClick={() => handleClickProblemType('MULTIPLE_CHOICE')}
        />
        <ProblemTypeButton
          label='주'
          isSelected={problemType === 'SINGLE_CHOICE'}
          onClick={() => handleClickProblemType('SINGLE_CHOICE')}
        />
      </div>
      {problemType === 'SINGLE_CHOICE' && <Input />}
      {problemType === 'MULTIPLE_CHOICE' && (
        <div className='flex w-full items-center justify-between gap-[0.4rem]'>
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
