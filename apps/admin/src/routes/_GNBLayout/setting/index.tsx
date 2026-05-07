import { createFileRoute, redirect } from '@tanstack/react-router';

import { getAccessibleNavSections } from '@/constants/adminPermissions';
import { adminSessionStorage } from '@/utils';

export const Route = createFileRoute('/_GNBLayout/setting/')({
  beforeLoad: () => {
    const session = adminSessionStorage.getSession();
    const settingSection = getAccessibleNavSections(session).find((section) => section.title === '설정');
    const firstSettingRoute = settingSection?.items[0]?.to ?? '/';

    throw redirect({
      to: firstSettingRoute,
    });
  },
});
