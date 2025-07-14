import Link from 'next/link';

import { IcNext, IcNotice } from '@svg';
import { useGetNotice, useGetNoticeUnreadCount } from '@/apis/controller/home';

const NoticeButton = () => {
  const { data: unreadCountData, isLoading } = useGetNoticeUnreadCount();
  const { data: getNoticeData } = useGetNotice();
  const { count: unreadCount } = unreadCountData ?? {};
  const { total, data: noticeData } = getNoticeData ?? { total: 0, data: [] };

  return (
    <Link
      href='/notice'
      className='relative flex h-full min-w-[12rem] flex-1 flex-col gap-[1.2rem] rounded-[1.6rem] bg-white px-[2.4rem] py-[2.0rem]'>
      {unreadCount && unreadCount > 0 && (
        <span className='bg-main font-bold-14 absolute -top-[4px] -right-[4px] flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-[4px] text-[11px] text-white'>
          {unreadCount}
        </span>
      )}
      <div className='flex w-full items-center justify-between gap-[0.8rem]'>
        <div className='flex items-center gap-[0.8rem]'>
          <IcNotice width={24} height={24} />
          <span className='font-bold-16 text-main'>공지 {total}건</span>
        </div>
        <IcNext width={10.76} height={21} />
      </div>
      {total === 0 ? (
        <span className='font-medium-14 text-lightgray500'>새로운 공지가 없습니다</span>
      ) : (
        <div className='flex w-full flex-col gap-[0.8rem]'>
          <span className='font-medium-14 truncate text-black'>{noticeData[0].content}</span>
        </div>
      )}
    </Link>
  );
};

export default NoticeButton;
