'use client';
import { RouteModal } from '@components';
import { useSearchParams } from 'next/navigation';

const page = () => {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');

  return (
    <RouteModal>
      <div className='max-h-[calc(100dvh-8rem)] w-[calc(100dvw-8rem)] max-w-[100rem] p-[2rem]'>
        <img src={imageUrl ?? ''} alt='full image' className='object-contain' />
      </div>
    </RouteModal>
  );
};

export default page;
