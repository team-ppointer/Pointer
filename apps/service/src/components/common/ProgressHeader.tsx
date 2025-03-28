'use client';

import { ProgressBar } from '@components';
import { IcList } from '@svg';
import { useParams, useRouter } from 'next/navigation';

interface ProgressHeaderProps {
  progress?: number;
}

const ProgressHeader = ({ progress }: ProgressHeaderProps) => {
  const router = useRouter();
  const { publishId } = useParams();

  return (
    <header className='bg-background fixed inset-0 z-40 h-fit'>
      <div className='flex h-[6rem] items-center px-[2rem]'>
        <IcList width={24} height={24} onClick={() => router.push(`/problem/list/${publishId}`)} />
      </div>
      {progress !== undefined && <ProgressBar progress={progress} />}
    </header>
  );
};

export default ProgressHeader;
