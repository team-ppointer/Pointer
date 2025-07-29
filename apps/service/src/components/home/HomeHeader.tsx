'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { IcSetting } from '@svg';
import { LogoHeader } from '@/assets/svg/logo';
import { getName, getGrade, getTeacherName } from '@/utils/common/auth';
import { usePathname } from 'next/navigation';

const HomeHeader = () => {
  const pathname = usePathname();
  const [name, setName] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const isTeacherPage = pathname.includes('/teacher');

  useEffect(() => {
    setMounted(true);
    const nameValue = isTeacherPage ? getTeacherName() : getName();
    const gradeValue = getGrade();
    setName(nameValue || '');
    setGrade(gradeValue || '');
  }, []);

  return (
    <header className='bg-background fixed inset-0 z-40 mx-auto flex h-[6rem] max-w-[768px] items-center justify-between px-[2rem]'>
      <Link href={isTeacherPage ? '/teacher' : '/'}>
        <LogoHeader width={106} height={24} title='로고' titleId='logo-icon' />
      </Link>
      <div className='flex items-center gap-[0.8rem]'>
        <div className='font-medium-12 text-main bg-sub2 flex h-[2.2rem] items-center justify-center rounded-[0.4rem] px-[0.8rem]'>
          {isTeacherPage ? '선생님' : mounted ? `${grade || ''}학년` : '학년'}
        </div>
        <div className='font-medium-14 text-black'>
          <>
            <span className='text-main mr-[0.4rem]'>{mounted ? name : ''}</span>님
          </>
        </div>
        <Link href={isTeacherPage ? '/teacher/my-page' : '/my-page'}>
          <IcSetting width={24} height={24} title='설정' titleId='setting-icon' />
        </Link>
      </div>
    </header>
  );
};

export default HomeHeader;
