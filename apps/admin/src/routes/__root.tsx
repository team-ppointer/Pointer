import { lazy } from 'react';
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { checkIsLoggedIn } from '../utils/auth';

const TanStackRouterDevtools =
  import.meta.env.MODE === 'production'
    ? () => null
    : lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/login') {
      return;
    }

    const isLoggedIn = await checkIsLoggedIn();
    if (!isLoggedIn) {
      throw redirect({
        to: '/login',
      });
    }
  },

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
