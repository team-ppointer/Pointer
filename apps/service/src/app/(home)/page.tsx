'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { BottomFixedArea, Button } from '@components';
import { IcCalendar, IcQuestionWhite } from '@svg';
import { trackEvent } from '@utils';
import { HomeHeader, NoticeButton, ProblemSwiper, WeekProgress } from '@/components/home';
import { useGetWeeklyPublish } from '@/apis';

const Page = () => {
  const router = useRouter();

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

  return (
    <>
      <HomeHeader />
      <main className='flex flex-col px-[2rem] pt-[6rem]'>
        <div className='flex h-[12rem] w-full items-center gap-[1.2rem] pt-[1.6rem]'>
          <NoticeButton />
          <WeekProgress />
        </div>
      </main>

      <div className='mt-[2rem] pb-[3.3rem]'>
        {isLoading ? (
          <div className='h-[456px] w-full' />
        ) : problemSets.length > 0 ? (
          <div className='flex h-[456px] items-center justify-center'>
            <ProblemSwiper problemSets={problemSets} onProblemSelect={setSelectedProblem} />
          </div>
        ) : (
          <div className='flex h-[456px] items-center justify-center'>
            <p className='font-medium-16 text-[#C6CAD4]'>아직 발행된 문제가 없어요.</p>
          </div>
        )}
      </div>
      <BottomFixedArea zIndex={10}>
        <footer className='flex flex-col gap-[1rem] px-[2rem] pt-[2.4rem] pb-[3.3rem]'>
          <Button variant='light' onClick={handleClickAllProblem}>
            <IcCalendar width={24} height={24} />
            날짜별로 보기
          </Button>
          <Button variant='blue' onClick={handleClickQnA}>
            <IcQuestionWhite width={24} height={24} />
            QnA 바로가기
          </Button>
        </footer>
      </BottomFixedArea>
    </>
  );
};

export default Page;
