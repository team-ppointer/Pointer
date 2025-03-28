import { IcStatusCorrect, IcStatusIncorrect, IcStatusNotStarted, IcStatusRetried } from '@svg';

interface Props {
  status: 'CORRECT' | 'INCORRECT' | 'RETRY_CORRECT' | 'NOT_STARTED';
}

const StatusIcon = ({ status }: Props) => {
  const statusIcon = {
    CORRECT: <IcStatusCorrect width={24} height={24} />,
    INCORRECT: <IcStatusIncorrect width={24} height={24} />,
    RETRY_CORRECT: <IcStatusRetried width={24} height={24} />,
    NOT_STARTED: <IcStatusNotStarted width={24} height={24} />,
  };

  return <div>{statusIcon[status]}</div>;
};

export default StatusIcon;
