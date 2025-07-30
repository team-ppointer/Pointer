'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useRouter } from 'next/navigation';

import { BaseModalTemplate } from '@components';
import { putRead, useGetNotice } from '@/apis/controller/home';
import { components } from '@schema';

import 'swiper/css';
import 'swiper/css/pagination';

type NoticeResp = components['schemas']['NoticeResp'];

const ModalSwiper = () => {
  const router = useRouter();
  const { data: getNoticeData } = useGetNotice();
  const noticeSets = getNoticeData?.data.filter((notice) => !notice.isRead) || [];
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
      <div className='h-auto max-h-[80vh] w-full overflow-auto rounded-[16px] bg-white shadow-lg'>
        <BaseModalTemplate>
          <BaseModalTemplate.Content>
            <BaseModalTemplate.Text className='font-bold-18 text-[#1E1E21]' text='새 공지' />
            <BaseModalTemplate.Text
              className='w-full text-center break-words whitespace-pre-wrap text-[#1E1E21]'
              text={notice.content}
            />
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
