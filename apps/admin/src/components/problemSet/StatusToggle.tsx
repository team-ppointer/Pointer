import { Button } from '@components';

interface StatusToggleProps {
  selectedStatus: 'CONFIRMED' | 'DOING';
  onSelect: (status: 'CONFIRMED' | 'DOING') => void;
}

const StatusToggle = ({ selectedStatus, onSelect }: StatusToggleProps) => {
  return (
    <div className='flex h-fit w-auto gap-[0.8rem] rounded-[8px] bg-white p-[0.4rem]'>
      <Button
        variant={selectedStatus === 'DOING' ? 'light' : 'dimmed'}
        onClick={() => onSelect('DOING')}>
        작업중
      </Button>

      <Button
        variant={selectedStatus === 'CONFIRMED' ? 'blue' : 'dimmed'}
        onClick={() => onSelect('CONFIRMED')}>
        컨펌 완료
      </Button>
    </div>
  );
};

export default StatusToggle;
