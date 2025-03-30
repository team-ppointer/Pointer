'use client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { RouteModal } from '@components';

const page = () => {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');

  return (
    <RouteModal>
      <div className='max-h-[calc(100dvh-8rem)] w-[calc(100dvw-8rem)] max-w-[100rem] p-[1.6rem]'>
        <Image
          src={imageUrl ?? ''}
          alt='full image'
          className='object-contain'
          width={700}
          height={200}
        />
      </div>
    </RouteModal>
  );
};

export default page;
