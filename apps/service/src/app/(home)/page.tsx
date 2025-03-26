import Link from 'next/link';
import { Button } from '@components';
import { IcSearch } from '@svg';
import { getHomeFeed } from '@apis';
import dayjs from 'dayjs';
import { DailyProgress } from '@types';

import {
  GuideButton,
  HomeHeader,
  NoticeButton,
  ProblemSwiper,
  WeekProgress,
} from '@/components/home';

const Page = async () => {
  const homeFeedData = await getHomeFeed();

  const dailyProgresses = homeFeedData?.dailyProgresses;
  const problemSets = homeFeedData?.problemSets;

  const startDate = dayjs(dailyProgresses?.[0]?.date).format('MM/DD');
  const endDate = dayjs(dailyProgresses?.[dailyProgresses.length - 1]?.date).format('DD');
  const progress: DailyProgress[] =
    dailyProgresses?.map((progress) => progress.progressStatus ?? 'NOT_STARTED') ?? [];

  return (
    <>
      <HomeHeader grade={2} name='홍길동' />
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
        <ProblemSwiper />
      </div>
      <footer className='bg-background mt-[2.4rem] px-[2rem] pb-[3.3rem]'>
        <Link href='/problem/calandar'>
          <Button variant='light'>
            <IcSearch width={24} height={24} />
            전체 문제 보기
          </Button>
        </Link>
      </footer>
    </>
  );
};

export default Page;
