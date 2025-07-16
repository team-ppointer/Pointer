'use client';

import { useEffect, useRef, useState } from 'react';

import QnaAskContent from '@/components/qna/QnaAskContent';
import { Button, Header } from '@components';

const Page = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFilled, setIsFilled] = useState(false);

  const handleTextareaOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.trim().length > 0) {
      setIsFilled(true);
    } else {
      setIsFilled(false);
    }
  };

  return (
    <>
      <Header title='질문하기' iconType='back' />
      <main className='flex h-dvh flex-col items-center justify-between px-[2rem] pt-[8rem] pb-[1.5rem]'>
        <QnaAskContent handleTextareaOnChange={handleTextareaOnChange} />
        <Button variant='blue' disabled={!isFilled}>
          등록하기
        </Button>
      </main>
    </>
  );
};

export default Page;
