import Link from 'next/link';

import { IcGuide } from '@svg';

const GuideButton = () => {
  return (
    <Link href='/comming-soon-modal' className='min-w-[12rem] flex-1'>
      <div className='flex w-full flex-col items-start gap-[0.8rem] rounded-[16px] bg-white px-[2.4rem] py-[2rem]'>
        <IcGuide width={24} height={24} />
        <div className='flex flex-col items-start'>
          <span className='font-bold-16'>포인터</span>
          <span className='font-bold-16'>사용설명서</span>
        </div>
      </div>
    </Link>
  );
};

export default GuideButton;
