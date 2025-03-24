import { ProgressHeader, SolveButton, TimeTag } from '@components';

const Page = () => {
  return (
    <>
      <ProgressHeader progress={10} />
      <main className='p-[2rem] pt-[8rem]'>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold-18 text-main'>문제 1번</h1>
          <TimeTag minutes={1} seconds={30} />
        </div>
        <img
          src='https://placehold.co/600x400'
          alt='문제 1'
          className='mt-[1.2rem] w-full object-contain'
        />

        <div className='mt-[2rem] flex flex-col gap-[1.6rem] sm:flex-row'>
          <SolveButton variant='direct' />
          <SolveButton variant='step' />
        </div>
      </main>
    </>
  );
};

export default Page;
