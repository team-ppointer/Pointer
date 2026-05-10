import { components } from '@schema';

import { adminSessionStorage } from './adminSessionStorage';
import { silentLogout } from './logout';
import { tokenStorage } from './tokenStorage';

import { toAdminSession } from '@/constants/adminPermissions';

// 리프레시 쿠키로 세션을 새로 받아 로컬 상태를 갱신한다.
// - 401 (refresh token 만료 등 명확한 인증 실패): 로컬 세션을 비우고 null 반환
// - 그 외 실패 (네트워크/5xx 등 transient): 로컬 상태 유지하고 null 반환 (graceful)
export const refreshSession = async (): Promise<string | null> => {
  let response: Response;
  try {
    response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  } catch (error) {
    console.warn('Session refresh network error:', error);
    return null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('Refresh token expired, clearing local session');
      silentLogout();
    } else {
      console.warn(`Session refresh failed with status: ${response.status}`);
    }
    return null;
  }

  try {
    const data = (await response.json()) as components['schemas']['AdminTokenResp'];
    const accessToken = data?.token?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new Error('Malformed session refresh response');
    }
    tokenStorage.setToken(accessToken);
    adminSessionStorage.setSession(toAdminSession(data));
    return accessToken;
  } catch (error) {
    console.warn('Session refresh response parse error:', error);
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
