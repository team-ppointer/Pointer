'use client';
import { useRouter } from 'next/navigation';

import { RouteModal, TwoButtonModalTemplate } from '@components';

const Page = () => {
  const router = useRouter();

  return (
    <RouteModal>
      <TwoButtonModalTemplate
        text={`로그인을 하면\n이용할 수 있는 기능이에요!`}
        topButtonText='로그인하기'
        bottomButtonText='닫기'
        handleClickTopButton={() => {
          router.push('/login');
        }}
        handleClickBottomButton={() => {
          router.back();
        }}
      />
    </RouteModal>
  );
};

export default Page;
