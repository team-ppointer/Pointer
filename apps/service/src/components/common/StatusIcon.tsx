import { IcStatusCorrect, IcStatusIncorrect, IcStatusNotStarted, IcStatusRetried } from '@svg';

interface Props {
  status: 'correct' | 'incorrect' | 'retried' | 'notStarted';
}

const StatusIcon = ({ status }: Props) => {
  const statusIcon = {
    correct: <IcStatusCorrect width={24} height={24} />,
    incorrect: <IcStatusIncorrect width={24} height={24} />,
    retried: <IcStatusRetried width={24} height={24} />,
    notStarted: <IcStatusNotStarted width={24} height={24} />,
  };

  return <div>{statusIcon[status]}</div>;
};

export default StatusIcon;
