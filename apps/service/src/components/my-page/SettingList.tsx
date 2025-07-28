'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { logout, trackEvent } from '@utils';
import { deleteAccount } from '@apis';

const SettingList = () => {
  const router = useRouter();

  const handleClickLogout = () => {
    trackEvent('logout_click');
    logout();
    router.push('/login');
  };
  const handleClickDeleteAccount = () => {
    trackEvent('delete_account_click');
    deleteAccount();
    logout();
    router.push('/login');
  };

  return (
    <ul className='flex w-full flex-col'>
      <li className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'>
        <Link href='/my-page/edit'>
          <p>회원 정보 수정</p>
        </Link>
      </li>
      <li className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'>
        <Link href='/comming-soon-modal'>
          <p>공지사항</p>
        </Link>
      </li>
      <li className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'>
        <Link href='/comming-soon-modal'>
          <p>이용 약관</p>
        </Link>
      </li>
      <li
        className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'
        onClick={handleClickLogout}>
        <Link href='/login'>
          <p>로그아웃</p>
        </Link>
      </li>
      <li
        className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'
        onClick={handleClickDeleteAccount}>
        <p>회원 탈퇴</p>
      </li>
    </ul>
  );
};

export default SettingList;
