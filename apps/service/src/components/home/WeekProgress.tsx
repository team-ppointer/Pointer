import { ProgressBox } from '@components';

interface WeekProgressProps {
  startDate: string;
  endDate: string;
}

const WeekProgress = ({ startDate, endDate }: WeekProgressProps) => {
  return (
    <div className='h-[12rem] w-[20rem] rounded-[1.6rem] bg-white px-[2.4rem] py-[1.5rem]'>
      <div className='flex items-end gap-[0.8rem]'>
        <h6 className='font-bold-16 text-black'>이번주 진도</h6>
        <span className='font-medium-12 text-midgray100'>
          {startDate} ~ {endDate}
        </span>
      </div>
      <div className='mt-[1.2rem] flex items-center justify-between'>
        {['월', '화', '수', '목', '금'].map((day) => (
          <div key={day} className='flex flex-col items-center gap-[0.8rem]'>
            <span className='font-medium-12 text-midgray100'>{day}</span>
            <ProgressBox progress='notStarted' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekProgress;
