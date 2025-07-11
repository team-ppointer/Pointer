'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log(searchParams);
  }, [searchParams]);

  return <></>;
};

export default Page;
