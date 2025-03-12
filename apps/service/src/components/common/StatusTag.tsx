import { IcTagCorrect, IcTagIncorrect, IcTagRetried, IcTagInprogress } from '@svg';

interface Props {
  status: 'correct' | 'incorrect' | 'retried' | 'inProgress' | 'notStarted';
}

const StatusTag = ({ status }: Props) => {
  const statusIcon = {
    correct: <IcTagCorrect width={16} height={16} />,
    incorrect: <IcTagIncorrect width={16} height={16} />,
    retried: <IcTagRetried width={16} height={16} />,
    inProgress: <IcTagInprogress width={16} height={16} />,
    notStarted: <></>,
  };

  const statusLabel = {
    correct: '정답',
    incorrect: '오답',
    retried: '정답',
    inProgress: '진행중',
    notStarted: '시작전',
  };

  const statusColor = {
    correct: 'bg-sub2 text-blue',
    incorrect: 'bg-lightred text-red',
    retried: 'bg-lightyellow text-yellow',
    inProgress: 'bg-lightgreen text-green',
    notStarted: 'bg-lightgray300 text-lightgray500',
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
