import { lazy } from 'react';
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { adminSessionStorage, checkIsLoggedIn, silentLogout } from '../utils/auth';

import { canAccessPath, getFirstAccessibleRoute } from '@/constants/adminPermissions';

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

    const session = adminSessionStorage.getSession();
    const firstAccessibleRoute = getFirstAccessibleRoute(session);

    if (!firstAccessibleRoute) {
      silentLogout();
      throw redirect({
        to: '/login',
      });
    }

    if (!canAccessPath(session, location.pathname)) {
      throw redirect({
        to: firstAccessibleRoute,
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
