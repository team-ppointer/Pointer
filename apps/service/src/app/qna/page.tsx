'use client';

import { Button, Header } from '@components';

const Page = () => {
  return (
    <>
      <Header title='QnA 게시판' iconType='back' />
      <main className='flex h-dvh flex-col items-center justify-between px-[2rem] pt-[8rem] pb-[1.5rem]'>
        <Button variant='blue'>질문하기</Button>
      </main>
    </>
  );
};

export default Page;
