'use client';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { RouteModal } from '@components';
import { IcNext, IcPrev } from '@svg';

const Page = () => {
  const searchParams = useSearchParams();
  const imageUrls = searchParams.getAll('imageUrl');
  const index = Number(searchParams.get('index')) ?? 0;
  const [currentIndex, setCurrentIndex] = useState(index);

  return (
    <RouteModal className='absolute top-[50%] left-[50%] w-[100dvw] translate-x-[-50%] translate-y-[-50%] transform overflow-auto bg-transparent px-[2rem]'>
      <div className='flex w-full flex-col items-center justify-center gap-[3.2rem]'>
        <div className='relative flex max-h-[60vh] max-w-[80vw] items-center justify-center'>
          <Image
            src={imageUrls[currentIndex] ?? ''}
            alt={`full image ${currentIndex + 1}`}
            className='h-auto max-h-4/5 w-auto max-w-4/5 object-cover'
            width={800}
            height={600}
          />
        </div>
        <div className='flex w-full items-center justify-center gap-[1.6rem]'>
          <div className='min-h-[2.4rem] min-w-[2.4rem]'>
            {currentIndex > 0 && (
              <IcPrev width={24} height={24} onClick={() => setCurrentIndex(currentIndex - 1)} />
            )}
          </div>
          <p className='font-medium-16 text-center text-white'>{`${currentIndex + 1}/${imageUrls.length}`}</p>
          <div className='min-h-[2.4rem] min-w-[2.4rem]'>
            {currentIndex < imageUrls.length - 1 && (
              <IcNext width={24} height={24} onClick={() => setCurrentIndex(currentIndex + 1)} />
            )}
          </div>
        </div>
      </div>
    </RouteModal>
  );
};

export default Page;
