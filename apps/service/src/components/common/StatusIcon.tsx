import { IcStatusCorrect, IcStatusIncorrect, IcStatusNotStarted, IcStatusRetried } from '@svg';

interface Props {
  status: 'CORRECT' | 'INCORRECT' | 'SEMI_CORRECT' | 'NONE';
}

const StatusIcon = ({ status }: Props) => {
  const statusIcon = {
    CORRECT: <IcStatusCorrect width={24} height={24} />,
    INCORRECT: <IcStatusIncorrect width={24} height={24} />,
    SEMI_CORRECT: <IcStatusRetried width={24} height={24} />,
    NONE: <IcStatusNotStarted width={24} height={24} />,
  };

  return <div>{statusIcon[status]}</div>;
};

export default StatusIcon;
