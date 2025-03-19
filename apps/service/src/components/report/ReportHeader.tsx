'use client';

import { ProgressBar } from '@components';
import { IcList } from '@svg';
import { useParams, useRouter } from 'next/navigation';

interface ReportHeaderProps {
  progress?: number;
}

const ReportHeader = ({ progress }: ReportHeaderProps) => {
  const router = useRouter();
  const { publishId } = useParams();

  return (
    <header className='bg-background fixed inset-0 z-40 h-fit'>
      <div className='flex h-[6rem] items-center px-[2rem]'>
        <IcList width={24} height={24} onClick={() => router.push(`/problem/${publishId}`)} />
      </div>
      {progress && <ProgressBar progress={progress} />}
    </header>
  );
};

export default ReportHeader;
