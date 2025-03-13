'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

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
        <div className='bg-lightgray500 h-full w-full'></div>
      </SwiperSlide>
      <SwiperSlide>
        <div className='bg-lightgray400 h-full w-full'></div>
      </SwiperSlide>
      <SwiperSlide>
        <div className='bg-lightgray300 h-full w-full'></div>
      </SwiperSlide>
      <SwiperSlide>
        <div className='bg-lightgray200 h-full w-full'></div>
      </SwiperSlide>
      <SwiperSlide>
        <div className='bg-lightgray100 h-full w-full'></div>
      </SwiperSlide>
    </Swiper>
  );
};

export default ProblemSwiper;
