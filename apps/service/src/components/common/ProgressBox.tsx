import React from 'react';

interface ProgressBoxProps {
  progress: 'notStarted' | 'inProgress' | 'completed';
}

const ProgressBox = ({ progress }: ProgressBoxProps) => {
  const baseStyles = 'h-[2.8rem] w-[2.8rem] rounded-[8px]';
  const progressClass = {
    notStarted: 'bg-lightgray300',
    inProgress: 'bg-sub1',
    completed: 'bg-main',
  };

  return <div className={`${baseStyles} ${progressClass[progress]}`} />;
};

export default ProgressBox;
