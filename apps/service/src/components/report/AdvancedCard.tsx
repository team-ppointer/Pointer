import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { IcPaw, IcQuestion18 } from '@svg';
import { SmallButton } from '@components';
import { components } from '@schema';

type oneStepMoreContent = components['schemas']['ContentUpdateRequest'];

type Props = {
  contents?: oneStepMoreContent;
  handleClickQuestion?: () => void;
};

const AdvancedCard = ({ contents, handleClickQuestion }: Props) => {
  return (
    <div className='bg border-sub1 mt-[0.8rem] flex flex-col justify-between rounded-[1.6rem] border bg-white p-[2rem]'>
      <div className='flex flex-row justify-between'>
        <div className='flex flex-row gap-[0.8rem]'>
          <IcPaw width={20} height={20} />
          <span className='font-bold-16 text-main'>한 걸음 더</span>
        </div>
        <SmallButton
          className='flex flex-row gap-[4px]'
          variant='white'
          sizeType='small'
          onClick={handleClickQuestion}>
          <IcQuestion18 className='h-[1.8rem] w-[1.8rem]' />
          질문하기
        </SmallButton>
      </div>
      <ProblemViewer problem={contents} />
    </div>
  );
};

export default AdvancedCard;
