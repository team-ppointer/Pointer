import Link from 'next/link';

import { IcNext, IcNotice } from '@svg';

type Props = {
  count: number;
};

const NoticeButton = ({ count }: Props) => {
  return (
    <Link href='/notice'>
      <div className='mt-[1.6rem] flex h-[6.4rem] w-full items-center justify-between gap-[0.8rem] rounded-[1.6rem] bg-white px-[2.4rem]'>
        <div className='flex items-center gap-[0.8rem]'>
          <IcNotice width={24} height={24} />
          <span className='font-bold-16 text-main'>새 공지 {count}건</span>
        </div>
        <IcNext width={10.76} height={21} />
      </div>
    </Link>
  );
};

export default NoticeButton;
