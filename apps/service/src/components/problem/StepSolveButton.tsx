import React from 'react';

import { IcArrowGrow14 } from '@svg';

interface StepSolveButtonProps {
  onClick: () => void;
}

const StepSolveButton = ({ onClick }: StepSolveButtonProps) => {
  return (
    <div className='font-medium-12 flex items-center gap-[0.8rem]'>
      <span className='text-midgray100'>잘 모르겠다면</span>
      <button
        className='border-sub1 flex items-center gap-[0.4rem] rounded-[0.8rem] border bg-white px-[1.2rem] py-[0.5rem]'
        onClick={onClick}>
        <IcArrowGrow14 className='h-[1.4rem] w-[1.4rem]' />
        <span className='text-main'>단계적으로 풀어보기</span>
      </button>
    </div>
  );
};

export default StepSolveButton;
