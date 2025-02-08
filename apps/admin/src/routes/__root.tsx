import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className='flex gap-2 p-2 text-lg'>
        <Link
          to='/'
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true }}>
          Home
        </Link>
        <Link
          to='/problem'
          activeProps={{
            className: 'font-bold',
          }}>
          problem
        </Link>
        <Link
          to='/problem-set'
          activeProps={{
            className: 'font-bold',
          }}>
          problem-set
        </Link>
        <Link
          to='/publish'
          activeProps={{
            className: 'font-bold',
          }}>
          publish
        </Link>
      </div>
      <hr />
      <Outlet />
      <div className='text-[16px]'>
        <ReactQueryDevtools />
        <TanStackRouterDevtools />
      </div>
    </>
  );
}
