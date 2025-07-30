'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useRouter } from 'next/navigation';

import { BaseModalTemplate } from '@components';
import { putRead } from '@/apis/controller/home';
import { components } from '@schema';

import 'swiper/css';
import 'swiper/css/pagination';

type NoticeResp = components['schemas']['NoticeResp'];

type Props = {
  noticeSets: NoticeResp[];
};

const ModalSwiper = ({ noticeSets }: Props) => {
  const router = useRouter();
  const unreadNotices = noticeSets.filter((notice) => !notice.isRead);

  const onClickConfirm = async (noticeId: number) => {
    await putRead(noticeId);
    if (unreadNotices.length === 1) {
      router.back();
    }
  };
  const initialSlide = 0;

  const renderNoticeSlide = (notice: NoticeResp) => {
    return (
      <div className='h-full w-full rounded-[16px] bg-white shadow-lg'>
        <BaseModalTemplate>
          <BaseModalTemplate.Content>
            <p className='font-bold-18'>새 공지</p>
            <span className='font-medium-16 flex h-full w-full items-center justify-center text-center'>
              {notice.content}
            </span>
          </BaseModalTemplate.Content>
          <BaseModalTemplate.ButtonSection>
            <BaseModalTemplate.Button
              variant='blue'
              onClick={() => {
                onClickConfirm(notice.id);
              }}>
              확인
            </BaseModalTemplate.Button>
          </BaseModalTemplate.ButtonSection>
        </BaseModalTemplate>
      </div>
    );
  };

  return (
    <div className='flex h-full w-full'>
      <Swiper
        slidesPerView={'auto'}
        initialSlide={initialSlide}
        spaceBetween={12}
        centeredSlides={true}
        className='mySwiper h-full w-full'>
        {noticeSets.map((notice) => (
          <SwiperSlide key={notice.id} className='!h-auto !w-[31.2rem]'>
            {renderNoticeSlide(notice)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ModalSwiper;
