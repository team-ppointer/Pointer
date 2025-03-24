'use client';

import { AnswerInput, Button, NavigationFooter, ProgressHeader, SmallButton } from '@components';

const Page = () => {
  return (
    <>
      <ProgressHeader progress={10} />
      <main className='flex flex-col px-[2rem] py-[8rem] md:flex-row md:gap-[4rem]'>
        <div className='w-full'>
          <h1 className='font-bold-18 text-main'>문제 1번</h1>
          <img
            src='https://placehold.co/600x400'
            alt='문제 1'
            className='mt-[1.2rem] w-full object-contain'
          />

          <div className='mt-[0.6rem] mb-[0.4rem] flex items-center justify-end'>
            <SmallButton variant='underline' sizeType='small'>
              메인 문제 다시보기
            </SmallButton>
          </div>
        </div>

        <div className='w-full'>
          <h1 className='font-bold-16 text-black'>정답 선택</h1>

          <div className='mt-[1.2rem] flex flex-col gap-[2rem] lg:flex-row'>
            <AnswerInput answerType='MULTIPLE_CHOICE' selectedAnswer='' />
            <Button>제출하기</Button>
          </div>
        </div>
      </main>
      <NavigationFooter
        prevLabel='이전'
        nextLabel='다음'
        onClickPrev={() => {}}
        onClickNext={() => {}}
      />
    </>
  );
};

export default Page;
