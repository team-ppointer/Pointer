'use client';

import { postKakaoLogin } from '@apis';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

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
