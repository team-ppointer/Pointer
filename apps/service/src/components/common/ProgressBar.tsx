import React from 'react';

interface Props {
  progress: number;
}

const ProgressBar = ({ progress }: Props) => {
  return (
    <div className='bg-lightgray400 relative flex h-[2px] w-full'>
      <div className='bg-main absolute inset-0 h-full' style={{ width: `${progress}%` }} />
    </div>
  );
};

export default ProgressBar;
