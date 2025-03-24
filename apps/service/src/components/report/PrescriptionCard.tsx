import { SmallButton } from '@components';
import { IcStatusCorrect, IcStatusIncorrect, IcStatusNotStarted, IcStatusRetried } from '@svg';

type PrescriptionCardProps = {
  status?: 'CORRECT' | 'INCORRECT' | 'RETRY_CORRECT' | 'NOT_STARTED' | 'IN_PROGRESS';
  title: string;
  onClick: () => void;
};

const PrescriptionCard = ({ status = 'NOT_STARTED', title, onClick }: PrescriptionCardProps) => {
  return (
    <div className='flex h-[6.5rem] items-center justify-between rounded-[1.6rem] bg-white px-[2.4rem]'>
      <div className='flex items-center gap-[0.8rem]'>
        {status === 'CORRECT' && <IcStatusCorrect width={24} height={24} />}
        {status === 'INCORRECT' && <IcStatusIncorrect width={24} height={24} />}
        {status === 'RETRY_CORRECT' && <IcStatusRetried width={24} height={24} />}
        {status === 'NOT_STARTED' && <IcStatusNotStarted width={24} height={24} />}
        <p className='font-medium-16 text-black'>{title}</p>
      </div>
      <SmallButton onClick={onClick}>진단 및 처방</SmallButton>
    </div>
  );
};

export default PrescriptionCard;
