import { Button } from '@components';
import { IcSearch } from '@svg';

import { GuideButton, Header, NoticeButton, WeekProgress } from '@/components/home';

const Page = () => {
  return (
    <div className='px-[2rem]'>
      <Header grade={2} name='홍길동' />
      <main className='pt-[6rem]'>
        <p className='font-medium-12 text-lightgray500 pt-[1.6rem]'>
          아직은 고등학교 2학년 대상으로만 서비스를 하고 있어요!
        </p>
        {true && <NoticeButton count={1} />}
        <div className='flex items-center gap-[1.2rem] pt-[1.6rem]'>
          <GuideButton />
          <WeekProgress startDate='03/10' endDate='14' />
        </div>
      </main>
      <footer className='fixed right-0 bottom-[3.3rem] left-0 px-[2rem]'>
        <Button variant='light'>
          <IcSearch width={24} height={24} />
          전체 문제 보기
        </Button>
      </footer>
    </div>
  );
};

export default Page;
