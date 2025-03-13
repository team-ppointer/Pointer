import { Header } from '@components';

import { NameCard } from '@/components/my-page';

const Page = () => {
  return (
    <>
      <Header title='설정' />
      <main className='px-[2rem] pt-[6rem]'>
        <NameCard name='홍길동' grade={2} />
      </main>
    </>
  );
};

export default Page;
