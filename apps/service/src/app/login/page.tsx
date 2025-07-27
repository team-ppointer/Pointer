'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getAccessToken, trackEvent } from '@utils';
import { LogoLogin } from '@/assets/svg/logo';
import { GoogleButton, KakaoButton } from '@/components/login';
import { postSocialLogin } from '@apis';

const Page = () => {
  const router = useRouter();

  const handleLoginClick = async (social: 'KAKAO' | 'GOOGLE') => {
    trackEvent(`${social.toLowerCase()}_login_click`);
    const result = await postSocialLogin(social);
    if (result.isSuccess && result.loginUrl) {
      router.push(result.loginUrl);
    } else {
      console.error('로그인 URL을 가져오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className='mx-auto flex h-[100dvh] w-[33.5rem] flex-col justify-center gap-[6.4rem]'>
      <div className='mt-[6.4rem] flex flex-col items-center'>
        <p className='font-medium-16 text-center text-black'>
          손해설부터 처방까지
          <br />
          수학 문제 풀이 사고력을 위해
        </p>
        <LogoLogin width={250} height={57} className='mt-[2.4rem]' />
        <h1 className='text-main font-bold-24 mt-[1.6rem]'>포인터</h1>
      </div>
      <div className='flex flex-col items-center gap-[1.6rem]'>
        <p className='font-medium-12 text-lightgray500'>포인터는 태블릿의 스플릿뷰를 권장해요</p>
        <KakaoButton onClick={() => handleLoginClick('KAKAO')} />
        <GoogleButton onClick={() => handleLoginClick('GOOGLE')} />
      </div>
    </div>
  );
};

export default Page;
