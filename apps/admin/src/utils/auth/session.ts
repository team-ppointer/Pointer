import { components } from '@schema';

import { adminSessionStorage } from './adminSessionStorage';
import { silentLogout } from './logout';
import { tokenStorage } from './tokenStorage';

import { toAdminSession } from '@/constants/adminPermissions';

// refreshSession 결과의 의미를 caller 가 구분할 수 있도록 discriminated union 으로 표현.
// 'unauthorized' 는 명시적인 인증 실패라 caller 가 silentLogout 을 결정하고,
// 'transient' 는 네트워크/5xx 처럼 일시적 실패라 로컬 상태를 보존한다.
export type RefreshResult =
  | { kind: 'ok'; accessToken: string }
  | { kind: 'unauthorized' }
  | { kind: 'transient' };

// 동시 요청들이 각자 refresh API 를 호출하지 않도록 in-flight promise 를 공유한다.
let inflightRefresh: Promise<RefreshResult> | null = null;

const doRefreshSession = async (): Promise<RefreshResult> => {
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
    return { kind: 'transient' };
  }

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('Refresh token expired');
      return { kind: 'unauthorized' };
    }
    console.warn(`Session refresh failed with status: ${response.status}`);
    return { kind: 'transient' };
  }

  try {
    const data = (await response.json()) as components['schemas']['AdminTokenResp'];
    const accessToken = data?.token?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new Error('Malformed session refresh response');
    }
    tokenStorage.setToken(accessToken);
    adminSessionStorage.setSession(toAdminSession(data));
    return { kind: 'ok', accessToken };
  } catch (error) {
    console.warn('Session refresh response parse error:', error);
    return { kind: 'transient' };
  }
};

// 리프레시 쿠키로 세션을 새로 받는다. 동일 시점 여러 요청이 호출하면 한 번의
// 네트워크 호출 결과를 공유하며, 결과 분기 책임은 caller 에게 둔다.
export const refreshSession = (): Promise<RefreshResult> => {
  if (inflightRefresh) return inflightRefresh;
  inflightRefresh = doRefreshSession().finally(() => {
    inflightRefresh = null;
  });
  return inflightRefresh;
};

// 인증이 반드시 유효해야 하는 경로에서 사용. unauthorized 인 경우에만 silentLogout 을
// 호출한다 — transient 실패에서는 로컬 상태를 보존해 일시적 네트워크 장애로
// 사용자가 강제 로그아웃되지 않게 한다.
export const enforceSession = async (): Promise<string | null> => {
  const result = await refreshSession();
  if (result.kind === 'ok') return result.accessToken;
  if (result.kind === 'unauthorized') silentLogout();
  return null;
};
