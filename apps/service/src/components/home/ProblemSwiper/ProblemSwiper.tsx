'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import { ProblemCard, ProblemSecretCard } from '@/components/home';

import './ProblemSwiper.css';

const ProblemSwiper = () => {
  return (
    <Swiper
      slidesPerView={'auto'}
      initialSlide={3}
      spaceBetween={12}
      centeredSlides={true}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className='mySwiper'>
      <SwiperSlide>
        <ProblemCard
          month={3}
          day={10}
          title='점과 직선 사이의 거리 톺아보기 어쩌고 두줄짜리 제목목목모곰목'
          image='https://s3-moplus.s3.ap-northeast-2.amazonaws.com/problems/3/main-problem/e715280a-4d35-4dc7-a038-900cd66ab73f.jpg'
          solvedCount={45}
        />
      </SwiperSlide>
      <SwiperSlide>
        <ProblemCard
          month={3}
          day={11}
          title='점과 직선 사이의 거리 톺아보기 어쩌고 두줄짜리 제목목목모곰목'
          image='https://s3-moplus.s3.ap-northeast-2.amazonaws.com/problems/3/main-problem/e715280a-4d35-4dc7-a038-900cd66ab73f.jpg'
          solvedCount={45}
        />
      </SwiperSlide>
      <SwiperSlide>
        <ProblemCard
          month={3}
          day={12}
          title='점과 직선 사이의 거리 톺아보기 어쩌고 두줄짜리 제목목목모곰목'
          image='https://s3-moplus.s3.ap-northeast-2.amazonaws.com/problems/3/main-problem/e715280a-4d35-4dc7-a038-900cd66ab73f.jpg'
          solvedCount={45}
        />
      </SwiperSlide>
      <SwiperSlide>
        <ProblemSecretCard month={3} day={13} />
      </SwiperSlide>
      <SwiperSlide>
        <ProblemSecretCard month={3} day={14} />
      </SwiperSlide>
    </Swiper>
  );
};

export default ProblemSwiper;
