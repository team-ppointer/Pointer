'use client';

import { Button, StatusIcon, StatusTag } from '@components';
import { components } from '@schema';
import { IcDown, IcUp } from '@svg';
import Link from 'next/link';
import React, { useState } from 'react';

type ProblemFeedProgressesGetResponse = components['schemas']['ProblemFeedProgressesGetResponse'];

interface ProblemStatusCardProps {
  mainProblemNumber: number;
  publishId: string;
  problemData: ProblemFeedProgressesGetResponse;
}

const ProblemStatusCard = ({
  mainProblemNumber,
  publishId,
  problemData,
}: ProblemStatusCardProps) => {
  const [isOpen, setIsOpen] = useState(
    !problemData.childProblemStatuses?.every((childStatus) => childStatus === 'NOT_STARTED')
  );
  return (
    <article className='rounded-[16px] bg-white p-[2rem]'>
      <header className='flex items-center justify-between'>
        <div className='flex items-center justify-between'>
          <h2 className='font-bold-16 text-main w-[10rem]'>메인 문제 {mainProblemNumber}번</h2>
          <StatusTag status={problemData.status ?? 'NOT_STARTED'} />
        </div>
        {isOpen ? (
          <IcUp width={24} height={24} onClick={() => setIsOpen((prev) => !prev)} />
        ) : (
          <IcDown width={24} height={24} onClick={() => setIsOpen((prev) => !prev)} />
        )}
      </header>

      {isOpen && (
        <ul className='mt-[1.2rem] flex flex-col'>
          {problemData.childProblemStatuses?.map((childStatus, index) => (
            <li className='flex items-center justify-between py-[1.15rem]' key={index}>
              <p className='font-medium-14 text-black'>
                새끼 문제 {mainProblemNumber}-{index + 1}번
              </p>
              <StatusIcon status={childStatus} />
            </li>
          ))}
        </ul>
      )}

      <Link href={`/problem/solve/${publishId}/${problemData.problemId}`}>
        <Button className='mt-[1.6rem]'>문제 풀러 가기</Button>
      </Link>
    </article>
  );
};

export default ProblemStatusCard;
