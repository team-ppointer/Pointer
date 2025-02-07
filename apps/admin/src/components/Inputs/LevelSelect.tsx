import { LevelType } from '@types';

interface NumberProps {
  number: LevelType;
  isSelected: boolean;
  onClick: (level: LevelType) => void;
}

interface LevelSelectProps {
  level: LevelType | undefined;
  handleClickLevel: (level: LevelType) => void;
}

const LevelNumber = ({ number, isSelected, onClick }: NumberProps) => {
  const selectedStyle = isSelected
    ? 'bg-midgray200 text-white'
    : 'bg-lightgray300 text-lightgray500';
  return (
    <div
      className={`flex h-[5.6rem] w-[5.6rem] cursor-pointer items-center justify-center rounded-[8px] ${selectedStyle}`}
      onClick={() => onClick(number)}>
      <span className='font-medium-24'>{number}</span>
    </div>
  );
};

const LevelSelect = ({ level, handleClickLevel }: LevelSelectProps) => {
  return (
    <div className='flex items-center gap-[1.6rem]'>
      {Array.from({ length: 10 }, (_, i) => (i + 1) as LevelType).map((num) => (
        <LevelNumber key={num} number={num} isSelected={level === num} onClick={handleClickLevel} />
      ))}
    </div>
  );
};

export default LevelSelect;
