'use client';

import { useState } from 'react';

import Sidebar from '@/components/common/SideBar/SideBar';
import { Header, Input } from '@components';
import QnaList from '@/components/qna/QnaList';
import { IcCloseBig } from '@svg';
import useGetQnaExist from '@/apis/controller/qna/useGetQnaExist';
import MyChat from '@/components/qna/chat/MyChat';
import YourChat from '@/components/qna/chat/YourChat';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>('');
  const { data, isSuccess } = useGetQnaExist({
    publishId: 1,
    problemId: 3,
    type: 'PROBLEM_CONTENT',
  });

  const qnaId = data?.id;

  return (
    <>
      <Header
        title='QnA 게시판'
        iconType='menu'
        rightIconType='close'
        menuOnClick={() => setIsOpen(true)}
      />
      <main className='relative flex h-dvh flex-col items-center justify-start px-[2rem] pt-[8rem] pb-[1.5rem]'>
        {isSuccess && data.isExist ? (
          <>
            <MyChat>하이하이</MyChat>
            <YourChat>안녕하세요</YourChat>
          </>
        ) : (
          <p className='font-medium-16 text-lightgray500 flex h-full items-center justify-center text-center'>
            등록된 질문이 없습니다.
          </p>
        )}

        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className='flex items-center justify-between gap-[1.6rem]'>
            <Input
              className='bg-background h-[4.8rem] w-full rounded-[1.6rem] p-[1.6rem] text-[1.6rem] focus:outline-0'
              placeholder='검색'
              type='text'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(e.currentTarget.value);
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
