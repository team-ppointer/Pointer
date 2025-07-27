'use client';

import clsx from 'clsx';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';

type ImageChatProps = {
  images: string[];
  isMine?: boolean;
};

const ImageChat = ({ images, isMine = true }: ImageChatProps) => {
  const router = useRouter();
  const query = images.map((u) => `imageUrl=${encodeURIComponent(u)}`).join('&');
  return (
    <div className='flex w-full flex-col items-center justify-start gap-[0.4rem]'>
      <div
        className={clsx(
          'flex w-full flex-row flex-wrap items-start gap-[0.4rem]',
          isMine ? 'justify-end pl-[2rem]' : 'justify-start pr-[2rem]'
        )}>
        {images.map((image, index) => (
          <NextImage
            key={index}
            src={image}
            alt={`Chat image ${index}`}
            className='h-[9.8rem] w-[9.8rem] rounded-[0.8rem] object-cover'
            width={98}
            height={98}
            onClick={() => router.push(`/images-modal?${query}&index=${index}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageChat;
