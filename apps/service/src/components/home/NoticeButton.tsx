import Link from 'next/link';

import { IcNext, IcNotice } from '@svg';

type Props = {
  count: number;
};

const NoticeButton = ({ count }: Props) => {
  return (
    <Link
      href='/notice'
      className='flex h-full min-w-[12rem] flex-1 flex-col gap-[1.2rem] rounded-[1.6rem] bg-white px-[2.4rem] py-[2.0rem]'>
      <div className='flex w-full items-center justify-between gap-[0.8rem]'>
        <div className='flex items-center gap-[0.8rem]'>
          <IcNotice width={24} height={24} />
          <span className='font-bold-16 text-main'>새 공지 {count}건</span>
        </div>
        <IcNext width={10.76} height={21} />
      </div>
      {count === 0 && (
        <span className='font-medium-14 text-lightgray500'>새로운 공지가 없습니다</span>
      )}
    </Link>
  );
};

export default NoticeButton;
