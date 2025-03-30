'use client';
import { useTrackEvent } from '@hooks';
import { getAccessToken } from '@utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { LogoLogin } from '@/assets/svg/logo';
import { KakaoButton } from '@/components/login';

const Page = () => {
  const { trackEvent } = useTrackEvent();
  const router = useRouter();
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${
    process.env.NEXT_PUBLIC_REST_API_KEY
  }&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=code`;

  const handleLoginClick = () => {
    trackEvent('kakao_login_click');
    window.location.replace(kakaoLoginUrl);
  };

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      router.replace('/');
    }
  }, []);

  return (
    <div className='mx-auto flex h-[100dvh] w-[33.5rem] flex-col pb-[2rem]'>
      <div className='flex flex-col items-center py-[9.6rem]'>
        <p className='font-medium-16 text-center text-black'>
          손해설부터 처방까지
          <br />
          수학 문제 풀이 사고력을 위해
        </p>
        <LogoLogin width={250} height={57} className='mt-[2.4rem]' />
        <h1 className='text-main font-bold-24 mt-[1.6rem]'>포인터</h1>
      </div>
      <div className='mt-auto flex flex-col items-center gap-[1.6rem]'>
        <p className='font-medium-12 text-lightgray500'>포인터는 태블릿의 스플릿뷰를 권장해요</p>
        <KakaoButton onClick={handleLoginClick} />
        {/* <AppleButton /> */}
      </div>
    </div>
  );
};

export default Page;
