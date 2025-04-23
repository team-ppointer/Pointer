import Image from 'next/image';

import { IcCommentCheck20, IcPrescription20 } from '@svg';
interface PointingImageContainerProps {
  src: string;
  variant: 'pointing' | 'prescription';
}

const PointingImageContainer = ({ src, variant }: PointingImageContainerProps) => {
  return (
    <div className='border-sub1 flex flex-col gap-[1rem] rounded-[1.6rem] border bg-white p-[1.6rem]'>
      <div className='flex items-center gap-[0.8rem]'>
        {variant === 'pointing' ? (
          <IcCommentCheck20 width={20} height={20} />
        ) : (
          <IcPrescription20 width={20} height={20} />
        )}
        <h3 className='font-bold-16 text-main'>{variant === 'pointing' ? '포인팅' : '처방'}</h3>
      </div>
      <Image
        src={src}
        alt={variant === 'pointing' ? '포인팅' : '처방'}
        className='w-full object-contain'
        width={700}
        height={200}
        priority
      />
    </div>
  );
};

export default PointingImageContainer;
