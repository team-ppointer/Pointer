import { createFileRoute, redirect } from '@tanstack/react-router';
import { adminSessionStorage, logout } from '@utils';
import { Lock, LogOut } from 'lucide-react';

import { getFirstAccessibleRoute } from '@/constants/adminPermissions';

export const Route = createFileRoute('/no-access/')({
  beforeLoad: () => {
    // 권한이 부여된 사용자가 이 페이지에 머물지 않도록 가드
    const firstAccessibleRoute = getFirstAccessibleRoute(adminSessionStorage.getSession());
    if (firstAccessibleRoute) {
      throw redirect({ to: firstAccessibleRoute });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const session = adminSessionStorage.getSession();

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-gray-50 p-6'>
      <div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm'>
        <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600'>
          <Lock className='h-6 w-6' />
        </div>
        <h1 className='text-xl font-bold text-gray-900'>접근 가능한 메뉴가 없습니다</h1>
        <p className='mt-3 text-sm leading-relaxed text-gray-600'>
          {session?.email ? (
            <>
              현재 계정(<span className='font-semibold text-gray-800'>{session.email}</span>)에
              <br />
              부여된 메뉴 권한이 없습니다.
            </>
          ) : (
            '현재 계정에 부여된 메뉴 권한이 없습니다.'
          )}
          <br />
          관리자에게 권한 부여를 요청해주세요.
        </p>
        <button
          type='button'
          onClick={logout}
          className='mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
          <LogOut className='h-4 w-4' />
          로그아웃
        </button>
      </div>
    </div>
  );
}
