'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import dayjs from 'dayjs';

import { components } from '@schema';
import { ProblemCard, ProblemSecretCard, ProblemEmptyCard } from '@/components/home';

import './ProblemSwiper.css';

type ProblemSetHomeFeedResponse = components['schemas']['ProblemSetHomeFeedResponse'];

interface ProblemSwiperProps {
  problemSets: ProblemSetHomeFeedResponse[];
}

const renderProblemCard = (problem: ProblemSetHomeFeedResponse, dateString: string) => {
  // 문제가 없는 경우
  if (problem.publishId === null || problem.publishId === undefined) {
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
      publishId={problem.publishId}
      dateString={dateString}
      title={problem.title ?? ''}
      image={problem.problemHomeFeedResponse?.mainProblemImageUrl ?? ''}
      solvedCount={problem.submitCount ?? 0}
    />
  );
};

const ProblemSwiper = ({ problemSets }: ProblemSwiperProps) => {
  const dayOfWeek = dayjs().day();

  const initialSlide = dayOfWeek === 0 || dayOfWeek === 6 ? 4 : dayOfWeek - 1;

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
