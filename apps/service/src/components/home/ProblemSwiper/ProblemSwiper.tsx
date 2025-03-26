'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { components } from '@schema';
import dayjs from 'dayjs';

import { ProblemCard, ProblemSecretCard, ProblemEmptyCard } from '@/components/home';

import './ProblemSwiper.css';

type ProblemSetHomeFeedResponse = components['schemas']['ProblemSetHomeFeedResponse'];

interface ProblemSwiperProps {
  problemSets: ProblemSetHomeFeedResponse[];
}

const renderProblemCard = (problem: ProblemSetHomeFeedResponse, dateString: string) => {
  // 문제가 없는 경우
  if (problem.problemSetId === null || problem.problemSetId === undefined) {
    return <ProblemEmptyCard dateString={dateString} />;
  }

  // 미래 날짜의 비공개 문제인 경우
  const today = dayjs();
  const date = dayjs(problem.date);
  const isSecret = date.isAfter(today);

  if (isSecret) {
    return <ProblemSecretCard dateString={dateString} />;
  }

  // 공개된 일반 문제인 경우
  return (
    <ProblemCard
      dateString={dateString}
      title={problem.title ?? ''}
      image={problem.problemHomeFeedResponse?.mainProblemImageUrl ?? ''}
      solvedCount={problem.submitCount ?? 0}
    />
  );
};

const ProblemSwiper = ({ problemSets }: ProblemSwiperProps) => {
  const initialSlide = problemSets.findIndex(
    (problem) => problem.date === dayjs().format('YYYY-MM-DD')
  );
  return (
    <Swiper
      slidesPerView={'auto'}
      initialSlide={initialSlide ?? 0}
      spaceBetween={12}
      centeredSlides={true}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className='mySwiper'>
      {problemSets.map((problem, index) => {
        const date = dayjs(problem.date);
        const dateString = date.format('MM월 DD일');

        return <SwiperSlide key={index}>{renderProblemCard(problem, dateString)}</SwiperSlide>;
      })}
    </Swiper>
  );
};

export default ProblemSwiper;
