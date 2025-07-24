import Image from 'next/image';

import { IcCommentCheck20, IcPrescription20, IcQuestion18 } from '@svg';
import { components } from '@schema';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import { SmallButton } from '@components';

type Contentype = components['schemas']['ContentResp'];

interface PointingImageContainerProps {
  contents: Contentype;
  variant: 'pointing' | 'prescription';
}

const PointingImageContainer = ({ contents, variant }: PointingImageContainerProps) => {
  return (
    <div>
      <div className='flex justify-between'>
        <div className='flex items-center gap-[0.8rem]'>
          {variant === 'pointing' ? (
            <IcCommentCheck20 width={20} height={20} />
          ) : (
            <IcPrescription20 width={20} height={20} />
          )}
          <h3 className='font-bold-16 text-main'>{variant === 'pointing' ? '포인팅' : '처방'}</h3>
        </div>
        <SmallButton
          className='flex flex-row gap-[4px]'
          variant='white'
          sizeType='small'
          onClick={() => {}}>
          <IcQuestion18 className='h-[1.8rem] w-[1.8rem]' />
          질문하기
        </SmallButton>
      </div>
      <ProblemViewer problem={contents} />
    </div>
  );
};

export default PointingImageContainer;
