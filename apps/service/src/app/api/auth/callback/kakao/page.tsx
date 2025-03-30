'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { postKakaoLogin } from '@apis';

const Page = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    if (code) {
      postKakaoLogin(code);
    }
  }, []);

  return <></>;
};

export default Page;
