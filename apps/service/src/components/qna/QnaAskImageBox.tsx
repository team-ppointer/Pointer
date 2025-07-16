import Image from 'next/image';

import { IcClose } from '@svg';

type QnaAskImageBoxProps = {
  imageUrl: string;
  onDelete?: () => void;
};

const QnaAskImageBox = ({ imageUrl, onDelete }: QnaAskImageBoxProps) => {
  return (
    <div className='relative flex shrink-0 items-center justify-center'>
      <Image
        className='h-[4.8rem] w-[4.8rem] rounded-[0.8rem] bg-white object-cover'
        width={48}
        height={48}
        src={imageUrl}
        alt='Preview'
      />
      <button
        onClick={onDelete}
        className='absolute top-[-0.4rem] right-[-0.4rem] z-10 flex items-center justify-center rounded-full bg-transparent'>
        <IcClose width={16} height={16} />
      </button>
    </div>
  );
};

export default QnaAskImageBox;
