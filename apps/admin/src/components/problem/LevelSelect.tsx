import { LevelType } from '@types';

interface LevelSelectProps {
  selectedLevel: number | undefined;
  onChange: (e: number) => void;
}

const LevelSelect = ({ selectedLevel, onChange }: LevelSelectProps) => {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {Array.from({ length: 10 }, (_, i) => (i + 1) as LevelType).map((num) => (
        <label key={num} className='cursor-pointer'>
          <input
            type='radio'
            value={num}
            checked={selectedLevel === num}
            onChange={() => onChange(num)}
            className='hidden'
          />
          <div
            className={`group flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold transition-all duration-300 ${
              selectedLevel === num
                ? 'scale-110 bg-gradient-to-br from-[var(--color-main)] to-[var(--color-main)]/90 text-white shadow-lg shadow-[var(--color-main)]/30'
                : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
            }`}>
            <span>{num}</span>
          </div>
        </label>
      ))}
    </div>
  );
};

export default LevelSelect;
