'use client';
import { useRouter } from 'next/navigation';

import { useGetNotice } from '@/apis/controller/home';
import ModalSwiper from '@/components/common/Modals/ModalSwiper';

const Page = () => {
  const router = useRouter();
  const { data: getNoticeData } = useGetNotice();
  const noticeData = getNoticeData?.data.filter((notice) => !notice.isRead) || [];

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={() => router.back()}>
      <div className='absolute h-full w-full bg-black opacity-50' />
      <div
        className='relative flex flex-row flex-nowrap items-center gap-[1.0rem] overflow-x-auto'
        style={{
          scrollSnapType: 'x mandatory',
        }}
        onClick={(e) => e.stopPropagation()}>
        <ModalSwiper noticeSets={noticeData} />
      </div>
    </div>
  );
};

export default Page;
