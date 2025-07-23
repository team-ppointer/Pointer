'use client';

import { useState } from 'react';
import clsx from 'clsx';

import Sidebar from '@/components/common/SideBar/SideBar';
import { Header, Input } from '@components';
import { IcCloseBig } from '@svg';
import { QnaDetailContent, QnaList } from '@/components/qna';
import { useGetQnaById, useGetQnaExist } from '@/apis/controller/qna';
import { MyChat, YourChat } from '@/components/qna/chat';
import ContextMenu from '@/components/qna/chat/ContextMenu';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [modifyMode, setModifyMode] = useState(true);
  const { data, isSuccess } = useGetQnaExist({
    publishId: 1,
    problemId: 3,
    type: 'PROBLEM_CONTENT',
  });

  const qnaId = data?.id ?? -1;

  const { data: qnaData, isSuccess: isQnaSuccess } = useGetQnaById(qnaId);

  return (
    <>
      <Header
        title='QnA 게시판'
        iconType='menu'
        rightIconType='close'
        menuOnClick={() => setIsOpen(true)}
      />
      <main
        onClick={(e) => {
          e.stopPropagation();
        }}
        className='relative flex h-dvh flex-col items-center justify-start px-[2rem] pt-[8rem] pb-[1.5rem]'>
        {isSuccess && data.isExist ? (
          <>
            <div className={clsx(modifyMode ? 'z-100' : 'z-0')}>
              <MyChat>
                {qnaData && isQnaSuccess && (
                  <QnaDetailContent {...qnaData} modifyMode={modifyMode} />
                )}
              </MyChat>
              {modifyMode && <ContextMenu />}
            </div>
            <YourChat>안녕하세요</YourChat>
            <YourChat>안녕하세요</YourChat>
            <YourChat>안녕하세요</YourChat>
            <YourChat>안녕하세요</YourChat>
            <YourChat>안녕하세요</YourChat>
            <YourChat>안녕하세요</YourChat>
            <YourChat>안녕하세요</YourChat>
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
      {modifyMode && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center`}
          onClick={() => setModifyMode(false)}>
          <div className='absolute inset-0 bg-black opacity-50' />
        </div>
      )}
    </>
  );
};

export default Page;
