'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useTrackEvent } from '@hooks';

const SettingList = () => {
  const { trackEvent } = useTrackEvent();
  const router = useRouter();

  const handleClickLogout = () => {
    trackEvent('logout_click');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('name');
    router.push('/login');
  };

  return (
    <ul className='flex w-full flex-col'>
      {/* <li className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'>
        <Link href='/my-page'>
          <p>회원 정보 수정</p>
        </Link>
      </li>
      <li className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'>
        <Link href='/my-page'>
          <p>공지사항</p>
        </Link>
      </li> */}
      <li className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'>
        <Link href='/my-page'>
          <p>이용 약관</p>
        </Link>
      </li>
      <li
        className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'
        onClick={handleClickLogout}>
        <Link href='/my-page'>
          <p>로그아웃</p>
        </Link>
      </li>
      {/* <li className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'>
        <Link href='/my-page'>
          <p>회원 탈퇴</p>
        </Link>
      </li> */}
    </ul>
  );
};

export default SettingList;
