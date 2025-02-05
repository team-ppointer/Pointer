import { Button } from '@components';

interface StatusToggleProps {
  selectedStatus: '작업중' | '컨펌 완료';
  onSelect: (status: '작업중' | '컨펌 완료') => void;
}

const StatusToggle = ({ selectedStatus, onSelect }: StatusToggleProps) => {
  return (
    <div className='flex h-fit w-auto gap-[0.8rem] rounded-[8px] bg-white p-[0.4rem]'>
      <Button
        variant={selectedStatus === '작업중' ? 'light' : 'dimmed'}
        onClick={() => onSelect('작업중')}>
        작업중
      </Button>

      <Button
        variant={selectedStatus === '컨펌 완료' ? 'blue' : 'dimmed'}
        onClick={() => onSelect('컨펌 완료')}>
        컨펌 완료
      </Button>
    </div>
  );
};

export default StatusToggle;
