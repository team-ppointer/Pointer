import { SmallButton } from '@components';
import {
  IcNext,
  IcNextSmall,
  IcStatusCorrect,
  IcStatusIncorrect,
  IcStatusNotStarted,
  IcStatusRetried,
} from '@svg';

type PrescriptionCardProps = {
  status?: 'CORRECT' | 'INCORRECT' | 'RETRY_CORRECT' | 'IN_PROGRESS' | 'NOT_STARTED';
  title: string;
  onClick: () => void;
};

const statusIcon = (status: PrescriptionCardProps['status']) => {
  switch (status) {
    case 'CORRECT':
      return <IcStatusCorrect width={24} height={24} />;
    case 'INCORRECT':
      return <IcStatusIncorrect width={24} height={24} />;
    case 'RETRY_CORRECT':
      return <IcStatusRetried width={24} height={24} />;
    case 'IN_PROGRESS':
    case 'NOT_STARTED':
      return <IcStatusNotStarted width={24} height={24} />;
  }
};

const PrescriptionCard = ({ status = 'NOT_STARTED', title, onClick }: PrescriptionCardProps) => {
  return (
    <div className='flex h-[6.5rem] items-center justify-between rounded-[1.6rem] bg-white px-[2.4rem]'>
      <div className='flex items-center gap-[0.8rem]'>
        {statusIcon(status)}
        <p className='font-medium-16 text-black'>{title}</p>
      </div>
      <div className='flex cursor-pointer items-center gap-[0.2rem]' onClick={onClick}>
        <span className='font-medium-16 text-main'>포인팅</span>
        <IcNextSmall width={24} height={24} />
      </div>
    </div>
  );
};

export default PrescriptionCard;
