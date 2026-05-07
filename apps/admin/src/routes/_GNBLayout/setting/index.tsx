import { createFileRoute, redirect } from '@tanstack/react-router';

import { hasMenuPermission } from '@/constants/adminPermissions';
import { adminSessionStorage } from '@/utils';

export const Route = createFileRoute('/_GNBLayout/setting/')({
  beforeLoad: () => {
    const session = adminSessionStorage.getSession();

    throw redirect({
      to: hasMenuPermission(session, 'ADMIN_ACCOUNT') ? '/setting/admins' : '/setting/roles',
    });
  },
});
