'use client';

import { useState } from 'react';
import ProblemViewer, { Problem } from '@repo/pointer-editor/ProblemViewer';

import { QnaAskContent } from '@/components/qna';
import { Button, Header } from '@components';
import { components } from '@schema';
import { useGetChildProblemById, useGetProblemById } from '@apis';

const dummyProps: {
  publishId: number;
  problemId: number | null;
  childProblemId: number | null;
  pointingId: number | null;
  type: components['schemas']['QnAResp']['type'];
} = {
  publishId: 1,
  problemId: null,
  childProblemId: 1,
  pointingId: null,
  type: 'CHILD_PROBLEM_CONTENT',
};

const Page = () => {
  const [isFilled, setIsFilled] = useState(false);

  const parentQuery = useGetProblemById(dummyProps.problemId);

  const childQuery = useGetChildProblemById(dummyProps.childProblemId);

  //메인 문제인 경우와 자식 문제인 경우를 구분하여 데이터를 가져옴
  // parentQuery는 메인 문제의 데이터를 가져오고, childQuery는 자식 문제의 데이터를 가져옴
  const response =
    (parentQuery?.data as components['schemas']['ProblemWithStudyInfoResp']) ??
    (childQuery?.data as components['schemas']['ChildProblemWithStudyInfoResp']);

  const problem: Problem = {
    id: response?.problemContent.id || 0,
    blocks: response?.problemContent.blocks || [],
  };

  const handleTextareaOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.trim().length > 0) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  };

  return (
    <>
      <Header title='질문하기' iconType='back' />
      <main className='flex min-h-dvh flex-col items-center justify-between gap-[1.6rem] px-[2rem] pt-[8rem] pb-[1.5rem]'>
        <div className='flex w-full flex-col items-center justify-center rounded-[1.6rem] bg-white'>
          <p className='font-bold-16 text-main w-full px-[2rem] pt-[2rem] text-start'>문제</p>
          <ProblemViewer problem={problem} loading={false} />
        </div>
        <QnaAskContent handleTextareaOnChange={handleTextareaOnChange} />
        <Button variant='blue' disabled={!isFilled} className=''>
          등록하기
        </Button>
      </main>
    </>
  );
};

export default Page;
