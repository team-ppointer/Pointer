'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import PulseLoader from 'react-spinners/PulseLoader';

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

  return (
    <div className='flex h-dvh w-full items-center justify-center'>
      <PulseLoader color='#617AF9' aria-label='Loading Spinner' />
    </div>
  );
};

export default Page;
