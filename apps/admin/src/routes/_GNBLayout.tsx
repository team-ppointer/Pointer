import { GNB } from '@components';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex w-[100dvw]'>
      <aside className='w-[20rem] shrink-0'>
        <GNB />
      </aside>
      <div className='flex min-w-0 flex-1 justify-center'>
        <main className='box-border w-[min(108rem,calc(100dvw-20rem))] p-[3.2rem]'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
