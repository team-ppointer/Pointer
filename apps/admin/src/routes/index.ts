import { createFileRoute, redirect } from '@tanstack/react-router';

import { getFirstAccessibleRoute } from '@/constants/adminPermissions';
import { adminSessionStorage } from '@/utils';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const firstAccessibleRoute = getFirstAccessibleRoute(adminSessionStorage.getSession());

    if (firstAccessibleRoute) {
      throw redirect({
        to: firstAccessibleRoute,
      });
    }

    // 권한이 하나도 없는 사용자는 안내 페이지로
    throw redirect({
      to: '/no-access',
    });
  },
});
