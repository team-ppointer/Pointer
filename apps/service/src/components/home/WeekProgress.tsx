import { useGetWeeklyProgress } from '@/apis/controller/home';
import { ProgressBar } from '@components';

const WeekProgress = () => {
  const { data } = useGetWeeklyProgress();
  const progress = data?.progress ?? 0;

  return (
    <div className='h-full rounded-[16px] bg-white px-[2.4rem] py-[1.5rem]'>
      <div className='flex items-end gap-[0.8rem]'>
        <h6 className='font-bold-16 text-black'>이번주 진행</h6>
      </div>
      <div className='mt-[1.2rem] flex items-center justify-between'>
        <ProgressBar type='week' progress={progress * 100} />
      </div>
    </div>
  );
};

export default WeekProgress;
