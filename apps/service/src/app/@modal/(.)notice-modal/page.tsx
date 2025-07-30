'use client';
import { useRouter } from 'next/navigation';

import ModalSwiper from '@/components/common/Modals/ModalSwiper';

const Page = () => {
  const router = useRouter();

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={() => router.back()}>
      <div className='absolute h-full w-full bg-black opacity-50' />
      <div
        className='flex max-h-[90vh] max-w-[95vw] flex-row items-center gap-[1.0rem] overflow-hidden'
        style={{
          scrollSnapType: 'x mandatory',
        }}
        onClick={(e) => e.stopPropagation()}>
        <ModalSwiper />
      </div>
    </div>
  );
};

export default Page;
