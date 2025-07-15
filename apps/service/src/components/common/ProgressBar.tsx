import React from 'react';

interface Props {
  progress: number;
  type?: 'week' | 'problem';
}

const ProgressBar = ({ progress, type = 'problem' }: Props) => {
  const baseStyles = {
    week: 'bg-lightgray300 relative flex h-[2.8rem] w-full rounded-[8px]',
    problem: 'bg-lightgray400 relative flex h-[2px] w-full',
  };

  return (
    <div className={baseStyles[type]}>
      <div
        className='bg-main absolute inset-0 h-full'
        style={{ width: `${progress}%`, borderRadius: type === 'week' ? '8px' : '0px' }}
      />
    </div>
  );
};

export default ProgressBar;
