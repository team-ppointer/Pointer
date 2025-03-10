import { IcDirect, IcStepByStep } from '@svg';

interface SolveButtonProps {
  variant: 'direct' | 'step';
}

const SolveButton = ({ variant = 'direct' }: SolveButtonProps) => {
  const baseStyles = 'w-full h-[7.6rem] rounded-[16px] flex items-center justify-center gap-[2rem]';

  const variantStyles = {
    direct: 'bg-white text-main border border-main',
    step: 'bg-main text-white ',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]}`}>
      {variant === 'direct' ? (
        <IcDirect width={24} height={24} />
      ) : (
        <IcStepByStep width={24} height={24} />
      )}
      <div className='flex flex-col items-start gap-[0.2rem]'>
        <span className='font-medium-16'>
          {variant === 'direct' ? '바로 풀어보기' : '단계별로 풀어보기'}
        </span>
        <span className='font-medium-12 text-sub1'>
          {variant === 'direct' ? '바로 메인 문제를 풀어요' : '작은 개념부터 풀어요'}
        </span>
      </div>
    </button>
  );
};

export default SolveButton;
