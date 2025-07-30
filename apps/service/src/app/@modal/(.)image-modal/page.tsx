'use client';
import { useSearchParams } from 'next/navigation';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { RouteModal } from '@components';
import { useGetChildProblemById, useGetChildProblemTeacherById } from '@apis';

const Page = () => {
  const searchParams = useSearchParams();
  const publishId = searchParams.get('publishId') || '';
  const childProblemId = searchParams.get('childProblemId') || '';
  const { data, isLoading } = useGetChildProblemById(+publishId, +childProblemId);

  return (
    <RouteModal>
      <div className='max-h-[calc(100dvh-8rem)] w-[calc(100dvw-8rem)] max-w-[100rem] p-[1.6rem]'>
        <ProblemViewer problem={data?.problemContent} loading={isLoading} />
      </div>
    </RouteModal>
  );
};

export default Page;
