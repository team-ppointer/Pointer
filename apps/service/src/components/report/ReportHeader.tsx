import { ProgressBar } from '@components';
import { IcList } from '@svg';

const ReportHeader = () => {
  return (
    <header className='fixed inset-0 z-40'>
      <div className='flex h-[6rem] items-center px-[2rem]'>
        <IcList width={24} height={24} />
      </div>
      <ProgressBar progress={50} />
    </header>
  );
};

export default ReportHeader;
