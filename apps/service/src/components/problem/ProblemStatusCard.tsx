'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button, StatusIcon, StatusTag } from '@components';
import { trackEvent } from '@utils';
import { components } from '@schema';
import { IcDown, IcUp } from '@svg';
import { postProblemSubmit } from '@apis';
import { useInvalidate } from '@hooks';

type ProblemFeedProgressesGetResponse = components['schemas']['ProblemFeedProgressesGetResponse'];

interface ProblemStatusCardProps {
  mainProblemNumber: number;
  publishId: number;
  problemData: ProblemFeedProgressesGetResponse;
}

const ProblemStatusCard = ({
  mainProblemNumber,
  publishId,
  problemData,
}: ProblemStatusCardProps) => {
  const { invalidateAll } = useInvalidate();
  const { problemId, status, childProblemStatuses } = problemData;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(
    !childProblemStatuses?.every((childStatus) => childStatus === 'NOT_STARTED')
  );

  const isSolved = status === 'CORRECT' || status === 'RETRY_CORRECT' || status === 'INCORRECT';

  const handleClickSolveButton = async () => {
    trackEvent('problem_list_card_solve_button_click', {
      problemId: problemId ?? '',
    });

    if (!problemId) return;
    await postProblemSubmit(publishId, problemId);
    invalidateAll();
    router.push(`/problem/solve/${publishId}/${problemId}`);
  };

  const handleClickReportButton = () => {
    trackEvent('problem_list_card_report_button_click', {
      problemId: problemId ?? '',
    });
    router.push(`/report/${publishId}/${problemId}/analysis`);
  };

  return (
    <article className='rounded-[16px] bg-white p-[2rem]'>
      <header className='flex items-center justify-between'>
        <div className='flex items-center justify-between'>
          <h2 className='font-bold-16 text-main w-[10rem]'>메인 문제 {mainProblemNumber}번</h2>
          <StatusTag status={status ?? 'NOT_STARTED'} />
        </div>
        <div className='cursor-pointer' onClick={() => setIsOpen((prev) => !prev)}>
          {isOpen ? <IcUp width={24} height={24} /> : <IcDown width={24} height={24} />}
        </div>
      </header>

      {isOpen && (
        <ul className='mt-[1.2rem] flex flex-col'>
          {childProblemStatuses?.map((childStatus, index) => (
            <li className='flex items-center justify-between py-[1.15rem]' key={index}>
              <p className='font-medium-14 text-black'>
                새끼 문제 {mainProblemNumber}-{index + 1}번
              </p>
              <StatusIcon status={childStatus} />
            </li>
          ))}
        </ul>
      )}

      <div className='mt-[1.6rem] flex gap-[0.8rem]'>
        <Button variant={isSolved ? 'light' : 'blue'} onClick={handleClickSolveButton}>
          문제 풀러 가기
        </Button>
        {isSolved && <Button onClick={handleClickReportButton}>해설 보기</Button>}
      </div>
    </article>
  );
};

export default ProblemStatusCard;
