'use client';
import { Modal, TwoButtonModalTemplate } from '@components';
import { useRouter } from 'next/navigation';

const page = () => {
  const router = useRouter();

  return (
    <Modal>
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
    </Modal>
  );
};

export default page;
