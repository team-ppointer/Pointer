'use client';

import { useState } from 'react';

import Sidebar from '@/components/common/SideBar/SideBar';
import { Button, Header } from '@components';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Header
        title='QnA 게시판'
        iconType='menu'
        rightIconType='close'
        menuOnClick={() => setIsOpen(true)}
      />
      <main className='relative flex h-dvh flex-col items-center justify-between px-[2rem] pt-[8rem] pb-[1.5rem]'>
        <Button variant='blue'>질문하기</Button>
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </main>
    </>
  );
};

export default Page;
