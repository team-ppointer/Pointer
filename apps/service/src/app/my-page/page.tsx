import { Header } from '@components';

import { NameCard, SettingList } from '@/components/my-page';

const Page = () => {
  return (
    <>
      <Header title='설정' />
      <main className='px-[2rem] pt-[6rem]'>
        <NameCard name='홍길동' grade={2} />
        <SettingList />
      </main>
    </>
  );
};

export default Page;
