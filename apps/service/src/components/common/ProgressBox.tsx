import { DailyProgress } from '@types';

interface ProgressBoxProps {
  progress: DailyProgress;
}

const ProgressBox = ({ progress }: ProgressBoxProps) => {
  const baseStyles = 'h-[2.8rem] w-[2.8rem] rounded-[8px]';
  const progressClass = {
    NOT_STARTED: 'bg-lightgray300',
    IN_PROGRESS: 'bg-sub1',
    COMPLETED: 'bg-main',
  };

  return <div className={`${baseStyles} ${progressClass[progress]}`} />;
};

export default ProgressBox;
