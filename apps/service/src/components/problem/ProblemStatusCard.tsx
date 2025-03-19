import { Button, StatusIcon, StatusTag } from '@components';
import { IcDown, IcUp } from '@svg';
import React, { useState } from 'react';

interface ProblemStatusCardProps {
  title: string;
}

const ProblemStatusCard = ({ title }: ProblemStatusCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <article className='rounded-[16px] bg-white p-[2rem]'>
      <header className='flex items-center justify-between'>
        <div className='flex w-[16.5rem] items-center justify-between'>
          <h2 className='font-bold-16 text-main'>{title}</h2>
          <StatusTag status='inProgress' />
        </div>
        {isOpen ? (
          <IcUp width={24} height={24} onClick={() => setIsOpen((prev) => !prev)} />
        ) : (
          <IcDown width={24} height={24} onClick={() => setIsOpen((prev) => !prev)} />
        )}
      </header>

      {isOpen && (
        <ul className='mt-[1.2rem] flex flex-col'>
          <li className='flex items-center justify-between py-[1.15rem]'>
            <p className='font-medium-14 text-black'>새끼 문제 1-1번</p>
            <StatusIcon status='correct' />
          </li>
          <li className='flex items-center justify-between py-[1.15rem]'>
            <p className='font-medium-14 text-black'>새끼 문제 1-2번</p>
            <StatusIcon status='correct' />
          </li>
          <li className='flex items-center justify-between py-[1.15rem]'>
            <p className='font-medium-14 text-black'>새끼 문제 1-3번</p>
            <StatusIcon status='correct' />
          </li>
        </ul>
      )}

      <Button className='mt-[1.6rem]'>문제 풀러 가기</Button>
    </article>
  );
};

export default ProblemStatusCard;
