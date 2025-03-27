import Link from 'next/link';
import React from 'react';

const SettingList = () => {
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
      <li className='font-medium-16 flex h-[4.8rem] w-full cursor-pointer items-center text-black'>
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
