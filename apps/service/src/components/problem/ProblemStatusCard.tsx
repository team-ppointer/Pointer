'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { Button, StatusIcon, StatusTag } from '@components';
import { trackEvent } from '@utils';
import { components } from '@schema';
import { IcDown, IcUp } from '@svg';
import { useInvalidate } from '@hooks';

type ProblemFeedProgressesGetResponse = components['schemas']['PublishProblemGroupResp'];

interface ProblemStatusCardProps {
  mainProblemNumber: number;
  problemId: number;
  publishId?: number;
  problemData: ProblemFeedProgressesGetResponse;
}

const ProblemStatusCard = ({
  mainProblemNumber,
  problemId,
  problemData,
  publishId,
}: ProblemStatusCardProps) => {
  const { studentId } = useParams<{ studentId: string }>();
  const { invalidateAll } = useInvalidate();
  const { no, progress, childProblems } = problemData;
  const {} = childProblems;
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(
    !childProblems?.every((childProblem) => childProblem.progress === 'NONE')
  );
  const isTeacherPage = pathname.includes('/teacher');

  useEffect(() => {
    setIsOpen(!childProblems?.every((childProblem) => childProblem.progress === 'NONE'));
  }, [childProblems]);

  const isSolved = progress === 'DONE' || progress === 'DOING';
  const hasChildProblem = childProblems && childProblems?.length > 0;

  const handleClickSolveButton = async () => {
    if (isTeacherPage) {
      router.push(`/teacher/problem/${studentId}/solve/${publishId}/${problemId}`);
      return;
    }
    trackEvent('problem_list_card_solve_button_click', {
      problemId: problemId ?? '',
    });

    if (!problemId) return;
    // await postProblemSubmit(publishId, problemId);
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
        <div className='flex items-center justify-between gap-[1.2rem]'>
          <h2 className='font-bold-16 text-main'>{mainProblemNumber} 번째 세트</h2>
          <StatusTag status={problemData.progress ?? 'NONE'} />
        </div>
        {hasChildProblem && (
          <div className='cursor-pointer' onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? <IcUp width={24} height={24} /> : <IcDown width={24} height={24} />}
          </div>
        )}
      </header>

      {isOpen && hasChildProblem && (
        <ul className='mt-[1.2rem] flex flex-col'>
          <li className='flex items-center justify-between py-[1.15rem]'>
            <p className='font-medium-14 text-black'>메인 문제 {mainProblemNumber}번</p>
            <StatusIcon status={problemData.problem.progress ?? 'NONE'} />
          </li>

          <li></li>
          {childProblems?.map((childProblem, index) => (
            <li className='flex items-center justify-between py-[1.15rem]' key={index}>
              <p className='font-medium-14 text-black'>
                새끼 문제 {mainProblemNumber}-{index + 1}번
              </p>
              <StatusIcon status={childProblem.progress ?? 'NONE'} />
            </li>
          ))}
        </ul>
      )}

      <div className='mt-[1.6rem] flex gap-[0.8rem]'>
        <Button
          className='flex-1'
          variant={isSolved ? 'light' : 'blue'}
          onClick={handleClickSolveButton}>
          {isTeacherPage ? '문제 열람하기' : '문제 풀러 가기'}
        </Button>
        {isSolved && !isTeacherPage && (
          <Button className='flex-1' onClick={handleClickReportButton}>
            해설 보기
          </Button>
        )}
      </div>
    </article>
  );
};

export default ProblemStatusCard;
