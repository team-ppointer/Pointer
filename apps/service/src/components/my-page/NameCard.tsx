import React from 'react';

interface NameCardProps {
  name: string;
  grade: number;
}

const NameCard = ({ name }: NameCardProps) => {
  return (
    <article className='center my-[2rem] flex gap-[0.8rem] rounded-[16px] bg-white p-[2rem]'>
      <p className='font-bold-18 text-black'>
        <strong className='text-main mr-[0.4rem]'>{name}</strong>
        <span>님</span>
      </p>
      {/* <p className='font-medium-14 text-lightgray500 flex items-end'>고등학교 {grade}학년</p> */}
    </article>
  );
};

export default NameCard;
