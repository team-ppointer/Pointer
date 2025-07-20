'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { setAccessToken, setRefreshToken } from '@utils';

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, isFirstLogin, accessToken, refreshToken } = Object.fromEntries(
    searchParams.entries()
  );

  useEffect(() => {
    if (!success || !accessToken) {
      router.replace('/login');
      return;
    }

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    if (isFirstLogin === 'true') {
      router.replace('/onboarding');
    } else {
      router.replace('/');
    }
  }, [searchParams]);

  return <></>;
};

export default Page;
