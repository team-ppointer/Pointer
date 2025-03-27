import React from 'react';

interface TimeTagProps {
  minutes?: number;
  seconds?: number;
}

const TimeTag = ({ minutes = 0, seconds = 0 }: TimeTagProps) => {
  return (
    <div className='bg-sub2 font-medium-12 flex h-[3rem] w-fit items-center gap-[0.8rem] rounded-[8px] px-[1.2rem] py-[0.6rem]'>
      <span className='text-black'>권장 시간</span>
      <span className='text-main'>
        {minutes}분 {seconds}초
      </span>
    </div>
  );
};

export default TimeTag;
