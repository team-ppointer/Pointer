import { LevelType } from '@types';

interface LevelSelectProps {
  selectedLevel: number | undefined;
  onChange: (e: number) => void;
}

const LevelSelect = ({ selectedLevel, onChange }: LevelSelectProps) => {
  return (
    <div className='flex items-center gap-400'>
      {Array.from({ length: 10 }, (_, i) => (i + 1) as LevelType).map((num) => (
        <label key={num} className='flex cursor-pointer items-center'>
          <input
            type='radio'
            value={num}
            checked={selectedLevel === num}
            onChange={() => onChange(num)}
            className='hidden'
          />
          <div
            className={`rounded-200 flex h-[5.6rem] w-[5.6rem] cursor-pointer items-center justify-center ${selectedLevel === num ? 'bg-midgray200 text-white' : 'bg-lightgray300 text-lightgray500'}`}>
            <span className='font-medium-24'>{num}</span>
          </div>
        </label>
      ))}
    </div>
  );
};

export default LevelSelect;
