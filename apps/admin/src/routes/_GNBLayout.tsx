import { GNB } from '@components';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <GNB />
      <main className='ml-[24rem] p-[6rem]'>
        <Outlet />
      </main>
    </>
  );
}
