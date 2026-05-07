import { createFileRoute, redirect } from '@tanstack/react-router';

import { getFirstAccessibleRoute } from '@/constants/adminPermissions';
import { adminSessionStorage, silentLogout } from '@/utils';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const firstAccessibleRoute = getFirstAccessibleRoute(adminSessionStorage.getSession());

    if (!firstAccessibleRoute) {
      silentLogout();
      throw redirect({
        to: '/login',
      });
    }

    throw redirect({
      to: firstAccessibleRoute,
    });
  },
});
