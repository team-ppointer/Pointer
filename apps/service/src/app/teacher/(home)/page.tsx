'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import { BottomFixedArea, BottomSheet, Button } from '@components';
import { IcCalendar, IcMessage, IcSmileFace, IcThumbtack } from '@svg';
import { setGrade, setName, trackEvent } from '@utils';
import { HomeHeader, ProblemSwiper, StudentSelectButton } from '@/components/home';
import { useGetUserInfo, useGetWeeklyPublish } from '@/apis';
import StudentSelectBottomSheetTemplate from '@/components/common/BottomSheet/templates/StudentSelectBottomSheetTemplate';
import { useModal } from '@hooks';
import useGetStudent from '@/apis/controller-teacher/student/useGetStudent';
import { useGetStudentProgress } from '@/apis/controller-teacher/student';
import useGetStudentWeeklyPublish from '@/apis/controller-teacher/problem/useGetStudentWeeklyPublish';

const Page = () => {
  const router = useRouter();
  const { data: userInfo, isSuccess: isUserInfoSuccess } = useGetUserInfo();
  const { data: students = { total: 0, data: [] }, isLoading: isLoadingStudents } = useGetStudent();

  const [selectedStudent, setSelectedStudent] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // 조회할 학생 ID 계산 (첫 번째 학생 또는 선택된 학생)
  const targetStudentId = useMemo(() => {
    // 선택된 학생이 있으면 그 학생의 ID 사용
    if (selectedStudent?.id) {
      return selectedStudent.id;
    }

    // 선택된 학생이 없고, 학생 데이터가 로드되었으며, 첫 번째 학생이 있으면 그 학생의 ID 사용
    if (!isLoadingStudents && students.data.length > 0) {
      return students.data[0].id;
    }

    return null;
  }, [selectedStudent, isLoadingStudents, students.data]);

  const targetStudent = useMemo(() => {
    if (selectedStudent) {
      return selectedStudent;
    }

    if (!isLoadingStudents && students.data.length > 0) {
      return {
        id: students.data[0].id,
        name: students.data[0].name,
      };
    }

    return null;
  }, [selectedStudent, isLoadingStudents, students.data]);

  const { data: studentProgress, isLoading: isLoadingStudentProgress } = useGetStudentProgress(
    targetStudentId || 0
  );

  const { data: studentWeeklyPublish, isLoading: isLoadingStudentWeeklyPublish } =
    useGetStudentWeeklyPublish(targetStudentId || 0);

  const problemSets = useMemo(() => {
    if (!studentWeeklyPublish?.data || !Array.isArray(studentWeeklyPublish.data)) {
      return [];
    }
    return studentWeeklyPublish.data;
  }, [studentWeeklyPublish]);

  const { data, isLoading } = useGetWeeklyPublish();
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedProblem, setSelectedProblem] = useState<{
    publishId: number;
    problemId: number;
  } | null>(null);

  const handleClickAllProblem = () => {
    router.push('/comming-soon-modal');
  };

  const handleClickStudentStatus = () => {
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

  const handleClickStudent = (student: { id: number; name: string }) => {
    setSelectedStudent(student);
    closeModal();
  };

  useEffect(() => {
    if (!isLoadingStudents && students.data.length > 0 && !selectedStudent) {
      setSelectedStudent({
        id: students.data[0].id,
        name: students.data[0].name,
      });
    }
  }, [isLoadingStudents, students, selectedStudent]);

  useEffect(() => {
    if (isUserInfoSuccess && userInfo) {
      setName(userInfo.name);
      setGrade(Number(userInfo.grade));
    }
  }, [isUserInfoSuccess, userInfo]);

  const isLoadingData = isLoading || isLoadingStudentWeeklyPublish;

  return (
    <>
      <HomeHeader />
      <main className='flex flex-col px-[2rem] pt-[6rem]'>
        <div className='flex items-center gap-[1.2rem] pt-[1.6rem]'>
          <StudentSelectButton
            onClick={handleClickStudentSelect}
            name={targetStudent?.name || '-'}
            progress={studentProgress?.progress || 0}
          />
          <Button variant='lightBlue' onClick={handleClickAllProblem} className='flex-1'>
            <IcThumbtack width={24} height={24} />
            공지 등록하기
          </Button>
        </div>
      </main>

      <div className='mt-[2.4rem]'>
        {isLoadingData ? (
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
      <BottomFixedArea zIndex={40}>
        <footer className='flex flex-col gap-[1rem] px-[2rem] pt-[2.4rem] pb-[4.9rem]'>
          <Button variant='light' onClick={handleClickAllProblem}>
            <IcCalendar width={24} height={24} />
            날짜별로 보기
          </Button>
          <div className='flex gap-[1.2rem]'>
            <Button variant='lightBlue' className='flex-1 gap-[1.2rem]' onClick={handleClickQnA}>
              <IcMessage width={24} height={24} />
              QnA 게시판
            </Button>
            <Button
              variant='lightBlue'
              className='flex-1 gap-[1.2rem]'
              onClick={handleClickStudentStatus}>
              <IcSmileFace width={24} height={24} />
              학생 상태
            </Button>
          </div>
        </footer>
      </BottomFixedArea>
      <BottomSheet isOpen={isOpen} onClose={closeModal}>
        <StudentSelectBottomSheetTemplate
          handleClickStudent={handleClickStudent}
          students={students}
          selectedStudentId={selectedStudent?.id}
        />
      </BottomSheet>
    </>
  );
};

export default Page;
