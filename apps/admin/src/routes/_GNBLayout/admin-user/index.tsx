import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout/admin-user/')({
  beforeLoad: () => {
    throw redirect({
      to: '/setting/admins',
    });
  },
});
