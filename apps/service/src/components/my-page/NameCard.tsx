'use client';

import { useEffect, useState } from 'react';

import { getName } from '@utils';

const NameCard = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getName());
  }, []);

  return (
    <article className='center my-[2rem] flex gap-[0.8rem] rounded-[16px] bg-white p-[2rem]'>
      <p className='font-bold-18 text-black'>
        <span className='text-main mr-[0.4rem]'>{name}</span>
        <span>님</span>
      </p>
      {/* <p className='font-medium-14 text-lightgray500 flex items-end'>고등학교 {grade}학년</p> */}
    </article>
  );
};

export default NameCard;
