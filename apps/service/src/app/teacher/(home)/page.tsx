'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BottomFixedArea, BottomSheet, Button } from '@components';
import { IcCalendar, IcMessage, IcSmileFace, IcThumbtack } from '@svg';
import { setGrade, setName, trackEvent } from '@utils';
import { HomeHeader, ProblemSwiper, StudentSelectButton } from '@/components/home';
import { useGetUserInfo, useGetWeeklyPublish } from '@/apis';
import StudentSelectBottomSheetTemplate from '@/components/common/BottomSheet/templates/StudentSelectBottomSheetTemplate';
import { useModal } from '@hooks';
import useGetStudent from '@/apis/controller-teacher/student/useGetStudent';

const Page = () => {
  const router = useRouter();
  const { data: userInfo, isSuccess: isUserInfoSuccess } = useGetUserInfo();
  const { data: students = { total: 0, data: [] }, isLoading: isLoadingStudents } = useGetStudent();
  const { data, isLoading } = useGetWeeklyPublish();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedProblem, setSelectedProblem] = useState<{
    publishId: number;
    problemId: number;
  } | null>(null);
  const problemSets = data?.data ?? [];

  const handleClickAllProblem = () => {
    router.push('/comming-soon-modal');
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
    router.push(`/teacher/qna?publishId=${publishId}&problemId=${problemId}`);
  };

  const handleClickStudentSelect = () => {
    openModal();
  };

  useEffect(() => {
    if (isUserInfoSuccess && userInfo) {
      setName(userInfo.name);
      setGrade(Number(userInfo.grade));
    }
  }, [isUserInfoSuccess, userInfo]);

  return (
    <>
      <HomeHeader />
      <main className='flex flex-col px-[2rem] pt-[6rem]'>
        <div className='flex items-center gap-[1.2rem] pt-[1.6rem]'>
          <StudentSelectButton onClick={handleClickStudentSelect} />
          <Button variant='lightBlue' onClick={handleClickAllProblem} className='flex-1'>
            <IcThumbtack width={24} height={24} />
            공지 등록하기
          </Button>
        </div>
      </main>

      <div className='mt-[2rem] pb-[3.3rem]'>
        {isLoading ? (
          <div className='h-[456px] w-full' />
        ) : problemSets.length > 0 ? (
          <ProblemSwiper problemSets={problemSets} onProblemSelect={setSelectedProblem} />
        ) : (
          <div className='w-full'></div>
        )}
      </div>
      <BottomFixedArea zIndex={30}>
        <footer className='flex flex-col gap-[1rem] px-[2rem] pt-[2.4rem] pb-[3.3rem]'>
          <Button variant='light' onClick={handleClickAllProblem}>
            <IcCalendar width={24} height={24} />
            날짜별로 보기
          </Button>
          <div className='flex gap-[1.2rem]'>
            <Button variant='lightBlue' className='flex-1 gap-[1.2rem]' onClick={handleClickQnA}>
              <IcMessage width={24} height={24} />
              QnA 게시판
            </Button>
            <Button variant='lightBlue' className='flex-1 gap-[1.2rem]' onClick={handleClickQnA}>
              <IcSmileFace width={24} height={24} />
              학생 상태
            </Button>
          </div>
        </footer>
      </BottomFixedArea>
      <BottomSheet isOpen={isOpen} onClose={closeModal}>
        <StudentSelectBottomSheetTemplate handleClickStudent={() => {}} students={students} />
      </BottomSheet>
    </>
  );
};

export default Page;
