'use client';
import { useRouter } from 'next/navigation';

import { Button } from '@components';
import { IcCalendar } from '@svg';
import { trackEvent } from '@utils';
import { HomeHeader, NoticeButton, ProblemSwiper, WeekProgress } from '@/components/home';
const Page = () => {
  const router = useRouter();

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
        <div className='flex h-[12rem] w-full items-center gap-[1.2rem] pt-[1.6rem]'>
          <NoticeButton />
          <WeekProgress />
        </div>
      </main>
      <div className='mt-[2.4rem]'>
        {/* {isLoading ? (
          <div className='h-[456px] w-full' />
        ) : problemSets ? (
          <ProblemSwiper problemSets={problemSets} />
        ) : (
          <></>
        )} */}
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
