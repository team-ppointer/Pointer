'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@components';
import { IcCalendar, IcQuestionWhite } from '@svg';
import { setGrade, setName, trackEvent } from '@utils';
import { HomeHeader, NoticeButton, ProblemSwiper, WeekProgress } from '@/components/home';
import { useGetUserInfo, useGetWeeklyPublish } from '@/apis';

const Page = () => {
  const router = useRouter();
  const { data: userInfo, isSuccess: isUserInfoSuccess } = useGetUserInfo();
  const { data, isLoading } = useGetWeeklyPublish();
  const [selectedProblem, setSelectedProblem] = useState<{
    publishId: number;
    problemId: number;
  } | null>(null);
  const problemSets = data?.data ?? [];

  const handleClickAllProblem = () => {
    trackEvent('home_all_problem_button_click');
    router.push('/problem/calandar');
  };

  const handleClickQnA = () => {
    const { publishId, problemId } = selectedProblem || {
      publishId: problemSets[0]?.id || 0,
      problemId: problemSets[0]?.problemSet.firstProblem.id || 0,
    };
    if (!publishId || !problemId) {
      console.warn('문제가 없습니다.');
      return;
    }
    trackEvent('home_qna_button_click');
    router.push(`/qna?publishId=${publishId}&problemId=${problemId}`);
  };

  useEffect(() => {
    if (isUserInfoSuccess && userInfo) {
      setName(userInfo.name);
      setGrade(Number(userInfo.grade));
    }
  }, [isUserInfoSuccess, userInfo]);

  return (
    <div className='flex min-h-screen flex-col'>
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

      <div className='mt-[2.4rem] flex-1'>
        {isLoading ? (
          <div className='h-[456px] w-full' />
        ) : problemSets.length > 0 ? (
          <ProblemSwiper problemSets={problemSets} onProblemSelect={setSelectedProblem} />
        ) : (
          <div className='w-full'></div>
        )}
      </div>

      <footer className='bg-background mt-auto flex flex-col gap-[1rem] px-[2rem] pt-[2.4rem] pb-[3.3rem]'>
        <Button variant='light' onClick={handleClickAllProblem}>
          <IcCalendar width={24} height={24} />
          날짜별로 보기
        </Button>
        <Button variant='blue' onClick={handleClickQnA}>
          <IcQuestionWhite width={24} height={24} />
          QnA 바로가기
        </Button>
      </footer>
    </div>
  );
};

export default Page;
