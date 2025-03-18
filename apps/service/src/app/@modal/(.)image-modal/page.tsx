'use client';

import { Modal } from '@components';
import { useSearchParams } from 'next/navigation';

const page = () => {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');
  console.log(imageUrl);

  return (
    <>
      <Modal>
        <img
          src={imageUrl ?? ''}
          alt='full image'
          className='max-h-[calc(100dvh-8rem)] w-[calc(100dvw-8rem)] max-w-[100rem] object-contain'
        />
      </Modal>
    </>
  );
};

export default page;
