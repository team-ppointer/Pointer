import { useSyncExternalStore } from 'react';
import { adminSessionStorage } from '@utils';

import { AdminSession } from '@/constants/adminPermissions';

// adminSessionStorage 의 변경에 반응해 컴포넌트가 자동으로 리렌더되도록 하는 훅.
// localStorage 직접 read 만 사용하면 reissueToken 후 GNB / 가드가 stale 한
// accessibleMenus 를 보여주는 문제가 생긴다.
const useAdminSession = (): AdminSession | null => {
  return useSyncExternalStore(
    adminSessionStorage.subscribe,
    adminSessionStorage.getSession,
    () => null
  );
};

export default useAdminSession;
