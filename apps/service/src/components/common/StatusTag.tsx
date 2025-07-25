import {
  IcTagCorrect,
  IcTagIncorrect,
  IcTagRetried,
  IcTagInprogress,
  IcTagDone,
  IcTagNone,
} from '@svg';

interface Props {
  status: 'CORRECT' | 'INCORRECT' | 'SEMI_CORRECT' | 'DOING' | 'NONE' | 'DONE';
}

const StatusTag = ({ status }: Props) => {
  const statusIcon = {
    CORRECT: <IcTagCorrect width={16} height={16} />,
    INCORRECT: <IcTagIncorrect width={16} height={16} />,
    SEMI_CORRECT: <IcTagRetried width={16} height={16} />,
    DOING: <IcTagInprogress width={16} height={16} className='mt-2' />,
    DONE: <IcTagDone width={16} height={16} className='mt-2' />,
    NONE: <IcTagNone width={16} height={16} className='mt-5' />,
  };

  const statusLabel = {
    CORRECT: '정답',
    INCORRECT: '오답',
    SEMI_CORRECT: '정답',
    DOING: '진행중',
    DONE: '완료',
    NONE: '시작전',
  };

  const statusColor = {
    CORRECT: 'bg-sub2 text-blue',
    INCORRECT: 'bg-lightred text-red',
    SEMI_CORRECT: 'bg-lightyellow text-yellow',
    DOING: 'bg-lightgreen text-[#0C9200]',
    DONE: 'bg-lightblue text-blue',
    NONE: 'bg-lightgray300 text-lightgray500',
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
