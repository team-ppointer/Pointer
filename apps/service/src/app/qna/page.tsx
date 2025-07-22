'use client';

import { useState } from 'react';

import Sidebar from '@/components/common/SideBar/SideBar';
import { Header, Input } from '@components';
import QnaList from '@/components/qna/QnaList';
import { IcCloseBig } from '@svg';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>('');
  return (
    <>
      <Header
        title='QnA 게시판'
        iconType='menu'
        rightIconType='close'
        menuOnClick={() => setIsOpen(true)}
      />
      <main className='relative flex h-dvh flex-col items-center justify-between px-[2rem] pt-[8rem] pb-[1.5rem]'>
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className='flex items-center justify-between gap-[1.6rem]'>
            <Input
              className='bg-background h-[4.8rem] w-full rounded-[1.6rem] p-[1.6rem] text-[1.6rem] focus:outline-0'
              placeholder='검색'
              type='text'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(e.currentTarget.value);
                  console.log(e.currentTarget.value);
                }
              }}
            />
            <IcCloseBig width={24} height={24} onClick={() => setIsOpen(false)} />
          </div>
          <QnaList search={search} />
        </Sidebar>
      </main>
    </>
  );
};

export default Page;
