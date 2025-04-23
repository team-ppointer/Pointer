import React from 'react';

import { IcQuestion18 } from '@svg';

interface DontKnowButtonProps {
  onClick: () => void;
}

const DontKnowButton = ({ onClick }: DontKnowButtonProps) => {
  return (
    <button
      className='border-sub1 font-medium-12 flex w-fit items-center gap-[0.4rem] rounded-[0.8rem] border bg-white px-[1.2rem] py-[0.5rem]'
      onClick={onClick}>
      <IcQuestion18 className='h-[1.8rem] w-[1.8rem]' />
      <span className='text-main'>모르겠어요</span>
    </button>
  );
};

export default DontKnowButton;
