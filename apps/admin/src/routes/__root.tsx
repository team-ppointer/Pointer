import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Outlet />
        <div className='text-[16px]'>
          <ReactQueryDevtools />
          <TanStackRouterDevtools />
        </div>
      </>
    );
  },
});
