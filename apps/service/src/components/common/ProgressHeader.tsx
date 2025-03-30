'use client';

import { ProgressBar } from '@components';
import { useTrackEvent } from '@hooks';
import { IcList } from '@svg';
import { useParams, useRouter } from 'next/navigation';

interface ProgressHeaderProps {
  progress?: number;
}

const ProgressHeader = ({ progress }: ProgressHeaderProps) => {
  const router = useRouter();
  const { publishId } = useParams();
  const { trackEvent } = useTrackEvent();

  const handleClickProblemList = () => {
    trackEvent('progress_header_problem_list_button_click');
    router.push(`/problem/list/${publishId}`);
  };

  return (
    <header className='bg-background fixed inset-0 z-40 h-fit'>
      <div className='flex h-[6rem] items-center px-[2rem]'>
        <IcList width={24} height={24} onClick={handleClickProblemList} />
      </div>
      {progress !== undefined && <ProgressBar progress={progress} />}
    </header>
  );
};

export default ProgressHeader;
