'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { IcSetting } from '@svg';
import { getName } from '@utils';
import { LogoHeader } from '@/assets/svg/logo';

const HomeHeader = () => {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(getName());
  }, []);

  return (
    <header className='bg-background fixed inset-0 z-40 mx-auto flex h-[6rem] max-w-[768px] items-center justify-between px-[2rem]'>
      <Link href='/'>
        <LogoHeader width={106} height={24} title='로고' titleId='logo-icon' />
      </Link>
      <div className='flex items-center gap-[0.8rem]'>
        {/* <div className='font-medium-12 text-main bg-sub2 flex h-[2.2rem] items-center justify-center rounded-[0.4rem] px-[0.8rem]'>
          {grade}학년
        </div> */}
        <div className='font-medium-14 text-black'>
          {name && (
            <>
              <span className='text-main mr-[0.4rem]'>{name}</span>님
            </>
          )}
        </div>
        <Link href='/my-page'>
          <IcSetting width={24} height={24} title='설정' titleId='setting-icon' />
        </Link>
      </div>
    </header>
  );
};

export default HomeHeader;
