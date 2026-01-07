'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import dayjs from 'dayjs';
import { usePathname } from 'next/navigation';
import type { Swiper as SwiperType } from 'swiper';

import { components } from '@schema';
import { ProblemCard, ProblemSecretCard, ProblemEmptyCard } from '@/components/home';

import './ProblemSwiper.css';

type ProblemSetHomeFeedResponse = components['schemas']['PublishResp'];

interface ProblemSwiperProps {
  problemSets: ProblemSetHomeFeedResponse[];
  studentId?: number;
  onProblemSelect: (problem: { publishId: number; problemId: number }) => void;
}

const renderProblemCard = (
  problem: ProblemSetHomeFeedResponse,
  dateString: string,
  isTeacherPage: boolean,
  studentId?: number
) => {
  // 문제가 없는 경우
  if (problem === null) {
    return <ProblemEmptyCard dateString={dateString} />;
  }

  // 미래 날짜의 비공개 문제인 경우
  const today = dayjs();
  const date = dayjs(problem.publishAt);
  const isSecret = date.isAfter(today);

  if (isSecret) {
    return <ProblemSecretCard dateString={dateString} />;
  }

  // 공개된 일반 문제인 경우
  return (
    <ProblemCard
      publishId={problem.id}
      dateString={dateString}
      title={problem.problemSet.firstProblem.title}
      problemContent={JSON.parse(problem.problemSet.firstProblem.problemContent)}
      studentId={isTeacherPage ? studentId : undefined}
    />
  );
};

const ProblemSwiper = ({ problemSets, onProblemSelect, studentId }: ProblemSwiperProps) => {
  const pathname = usePathname();
  const isTeacherPage = pathname.includes('/teacher');

  const dayOfWeek = dayjs().day();
  const initialSlide = dayOfWeek === 0 || dayOfWeek === 6 ? 4 : dayOfWeek - 1;

  const handleSlideChange = (swiper: SwiperType) => {
    const activeIndex = swiper.activeIndex;
    const activeProblem = problemSets[activeIndex];

    if (activeProblem && activeProblem.problemSet?.firstProblem) {
      onProblemSelect({
        publishId: activeProblem.id,
        problemId: activeProblem.problemSet.firstProblem.id,
      });
    }
  };

  return (
    <Swiper
      slidesPerView={'auto'}
      initialSlide={0}
      spaceBetween={12}
      centeredSlides={true}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className='mySwiper'
      onSlideChange={handleSlideChange}
      onSwiper={() => {
        const initialProblem = problemSets[initialSlide];
        if (initialProblem && initialProblem.problemSet?.firstProblem) {
          onProblemSelect({
            publishId: initialProblem.id,
            problemId: initialProblem.problemSet.firstProblem.id,
          });
        }
      }}>
      {problemSets.map((problem, index) => {
        const date = dayjs(problem.publishAt);
        const dateString = date.format('MM월 DD일');

        return (
          <SwiperSlide key={index}>
            {renderProblemCard(problem, dateString, isTeacherPage, studentId)}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default ProblemSwiper;
