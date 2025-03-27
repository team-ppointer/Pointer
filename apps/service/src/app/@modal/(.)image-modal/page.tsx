'use client';
import { RouteModal } from '@components';
import { useSearchParams } from 'next/navigation';

const page = () => {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');

  return (
    <RouteModal>
      <img
        src={imageUrl ?? ''}
        alt='full image'
        className='max-h-[calc(100dvh-8rem)] w-[calc(100dvw-8rem)] max-w-[100rem] object-contain'
      />
    </RouteModal>
  );
};

export default page;
