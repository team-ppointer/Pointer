'use client';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

import { Button } from '@components';
import { IcCalendar } from '@svg';
import { getHomeFeed } from '@apis';
import { DailyProgress } from '@types';
import { useTrackEvent } from '@hooks';
import {
  GuideButton,
  HomeHeader,
  NoticeButton,
  ProblemSwiper,
  WeekProgress,
} from '@/components/home';

const Page = () => {
  const router = useRouter();
  const { trackEvent } = useTrackEvent();
  const { data } = getHomeFeed();
  const homeFeedData = data?.data;

  const dailyProgresses = homeFeedData?.dailyProgresses;
  const problemSets = homeFeedData?.problemSets;

  const startDate = dayjs(dailyProgresses?.[0]?.date).format('MM/DD');
  const endDate = dayjs(dailyProgresses?.[dailyProgresses.length - 1]?.date).format('DD');
  const progress: DailyProgress[] =
    dailyProgresses?.map((progress) => progress.progressStatus ?? 'NOT_STARTED') ?? [];

  const handleClickAllProblem = () => {
    trackEvent('home_all_problem_button_click');
    router.push('/problem/calandar');
  };

  return (
    <>
      <HomeHeader />
      <main className='flex flex-col px-[2rem] pt-[6rem]'>
        <p className='font-medium-12 text-lightgray500 pt-[1.6rem]'>
          아직은 고등학교 2학년 대상으로만 서비스를 하고 있어요!
        </p>
        {false && <NoticeButton count={1} />}
        <div className='flex w-full items-center gap-[1.2rem] pt-[1.6rem]'>
          <GuideButton />
          <WeekProgress startDate={startDate} endDate={endDate} progress={progress} />
        </div>
      </main>
      <div className='mt-[2.4rem]'>
        <ProblemSwiper problemSets={problemSets ?? []} />
      </div>
      <footer className='bg-background mt-[2.4rem] px-[2rem] pb-[3.3rem]'>
        <Button variant='light' onClick={handleClickAllProblem}>
          <IcCalendar width={24} height={24} />
          날짜별로 보기
        </Button>
      </footer>
    </>
  );
};

export default Page;
