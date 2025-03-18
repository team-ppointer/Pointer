import { ProgressBar } from '@components';
import { IcList } from '@svg';

interface ReportHeaderProps {
  progress?: number;
}

const ReportHeader = ({ progress }: ReportHeaderProps) => {
  return (
    <header className='bg-background fixed inset-0 z-40 h-fit'>
      <div className='flex h-[6rem] items-center px-[2rem]'>
        <IcList width={24} height={24} />
      </div>
      {progress && <ProgressBar progress={progress} />}
    </header>
  );
};

export default ReportHeader;
