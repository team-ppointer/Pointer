import { Header } from '@components';
import { getProblemAll } from '@apis';

import { ProblemCalandar } from '@/components/problem';

const Page = async () => {
  const data = await getProblemAll({ year: 2025, month: 3 });

  return (
    <>
      <Header title='전체 문제' />
      <main className='px-[2rem] pt-[6rem]'>
        <ProblemCalandar />
      </main>
    </>
  );
};

export default Page;
