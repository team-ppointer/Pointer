import { lazy } from 'react';
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { adminSessionStorage, checkIsLoggedIn } from '../utils/auth';

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

    // /no-access 는 로그인된 사용자라면 누구나 접근 가능. 자체 가드에서
    // 권한이 생긴 경우 이탈시킨다.
    if (location.pathname === '/no-access') return;

    const session = adminSessionStorage.getSession();

    // 현재 경로가 허용되면 즉시 통과. 권한이 일부만 있는 사용자가
    // firstAccessibleRoute null 판단으로 강제 로그아웃되지 않도록 우선 검사한다.
    if (canAccessPath(session, location.pathname)) return;

    const firstAccessibleRoute = getFirstAccessibleRoute(session);
    if (firstAccessibleRoute) {
      throw redirect({
        to: firstAccessibleRoute,
      });
    }

    // 접근 가능한 경로가 하나도 없으면 안내 페이지로 보낸다.
    throw redirect({
      to: '/no-access',
    });
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
