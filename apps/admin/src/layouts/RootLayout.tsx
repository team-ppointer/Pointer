import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GNB } from '@components';

const RootLayout = () => {
  return (
    <>
      <GNB />
      <main className='ml-[24rem] p-[6rem]'>
        <Outlet />
      </main>
      <div className='text-[16px]'>
        <ReactQueryDevtools />
        <TanStackRouterDevtools />
      </div>
    </>
  );
};

export default RootLayout;
