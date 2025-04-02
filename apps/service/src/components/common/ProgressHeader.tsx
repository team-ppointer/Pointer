'use client';

import { useParams, useRouter } from 'next/navigation';

import { ProgressBar } from '@components';
import { trackEvent } from '@utils';
import { IcList } from '@svg';

interface ProgressHeaderProps {
  progress?: number;
}

const ProgressHeader = ({ progress }: ProgressHeaderProps) => {
  const router = useRouter();
  const { publishId } = useParams();

  const handleClickProblemList = () => {
    trackEvent('progress_header_problem_list_button_click');
    router.push(`/problem/list/${publishId}`);
  };

  return (
    <header className='bg-background fixed inset-0 z-40 mx-auto h-fit max-w-[768px]'>
      <div className='flex h-[6rem] items-center px-[2rem]'>
        <IcList width={24} height={24} onClick={handleClickProblemList} />
      </div>
      {progress !== undefined && <ProgressBar progress={progress} />}
    </header>
  );
};

export default ProgressHeader;
