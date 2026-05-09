import { components } from '@schema';

import { adminSessionStorage } from './adminSessionStorage';
import { silentLogout } from './logout';
import { tokenStorage } from './tokenStorage';

import { toAdminSession } from '@/constants/adminPermissions';

// 리프레시 쿠키로 세션을 새로 받아 로컬 상태를 갱신한다.
// 실패 시 로컬 상태는 건드리지 않고 null만 반환한다 (graceful refresh 용도).
export const refreshSession = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('Refresh token expired, user needs to login again');
      }
      throw new Error(`Session refresh failed with status: ${response.status}`);
    }

    const data = (await response.json()) as components['schemas']['AdminTokenResp'];
    const accessToken = data?.token?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new Error('Malformed session refresh response');
    }

    tokenStorage.setToken(accessToken);
    adminSessionStorage.setSession(toAdminSession(data));
    return accessToken;
  } catch (error) {
    console.warn('Session refresh failed:', error);
    return null;
  }
};

// 세션을 강제 갱신하고, 실패 시 silentLogout 으로 로컬 상태까지 비운다.
// 인증이 반드시 유효해야 하는 경로(라우트 가드, 미들웨어)에서 사용.
export const enforceSession = async (): Promise<string | null> => {
  const accessToken = await refreshSession();
  if (!accessToken) silentLogout();
  return accessToken;
};
