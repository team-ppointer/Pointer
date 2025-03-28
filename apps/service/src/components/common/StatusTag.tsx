import { IcTagCorrect, IcTagIncorrect, IcTagRetried, IcTagInprogress } from '@svg';

interface Props {
  status: 'CORRECT' | 'INCORRECT' | 'RETRY_CORRECT' | 'IN_PROGRESS' | 'NOT_STARTED';
}

const StatusTag = ({ status }: Props) => {
  const statusIcon = {
    CORRECT: <IcTagCorrect width={16} height={16} />,
    INCORRECT: <IcTagIncorrect width={16} height={16} />,
    RETRY_CORRECT: <IcTagRetried width={16} height={16} />,
    IN_PROGRESS: <IcTagInprogress width={16} height={16} />,
    NOT_STARTED: <></>,
  };

  const statusLabel = {
    CORRECT: '정답',
    INCORRECT: '오답',
    RETRY_CORRECT: '정답',
    IN_PROGRESS: '진행중',
    NOT_STARTED: '시작전',
  };

  const statusColor = {
    CORRECT: 'bg-sub2 text-blue',
    INCORRECT: 'bg-lightred text-red',
    RETRY_CORRECT: 'bg-lightyellow text-yellow',
    IN_PROGRESS: 'bg-lightgreen text-green',
    NOT_STARTED: 'bg-lightgray300 text-lightgray500',
  };

  return (
    <div
      className={`flex h-[3rem] w-fit items-center justify-center gap-[0.4rem] rounded-[8px] px-[0.8rem] ${statusColor[status]}`}>
      {statusIcon[status]}
      <span className='font-medium-12'>{statusLabel[status]}</span>
    </div>
  );
};

export default StatusTag;
