'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import dayjs from 'dayjs';

import { components } from '@schema';
import { ProblemCard, ProblemSecretCard, ProblemEmptyCard } from '@/components/home';

import './ProblemSwiper.css';

type ProblemSetHomeFeedResponse = components['schemas']['PublishResp'];

interface ProblemSwiperProps {
  problemSets: ProblemSetHomeFeedResponse[];
  onProblemSelect: (problem: { publishId: number; problemId: number }) => void;
}

const renderProblemCard = (problem: ProblemSetHomeFeedResponse, dateString: string) => {
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
      problem={problem.problemSet.firstProblem.problemContent}
    />
  );
};

const ProblemSwiper = ({ problemSets, onProblemSelect }: ProblemSwiperProps) => {
  const dayOfWeek = dayjs().day();
  const initialSlide = dayOfWeek === 0 || dayOfWeek === 6 ? 4 : dayOfWeek - 1;

  const handleSlideChange = (swiper: any) => {
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
      initialSlide={initialSlide}
      spaceBetween={12}
      centeredSlides={true}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className='mySwiper'
      onSlideChange={handleSlideChange}
      onSwiper={(swiper) => {
        // 초기 슬라이드에 대한 선택 처리
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

        return <SwiperSlide key={index}>{renderProblemCard(problem, dateString)}</SwiperSlide>;
      })}
    </Swiper>
  );
};

export default ProblemSwiper;
