import { components } from '@schema';

import { adminSessionStorage } from './adminSessionStorage';
import { tokenStorage } from './tokenStorage';
import { silentLogout } from './logout';

import { toAdminSession } from '@/constants/adminPermissions';

type ReissueOptions = {
  silentLogoutOnFail?: boolean;
};

// 리프레시 토큰을 이용한 액세스 토큰 재발급
export const reissueToken = async ({ silentLogoutOnFail = true }: ReissueOptions = {}): Promise<
  string | null
> => {
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
      throw new Error(`Token reissue failed with status: ${response.status}`);
    }

    const data = (await response.json()) as components['schemas']['AdminTokenResp'];
    const accessToken = data?.token?.accessToken;
    if (typeof accessToken !== 'string' || accessToken.length === 0) {
      throw new Error('Malformed reissue response');
    }

    tokenStorage.setToken(accessToken);
    adminSessionStorage.setSession(toAdminSession(data));
    return accessToken;
  } catch (error) {
    console.warn('Reissue failed:', error);
    if (silentLogoutOnFail) silentLogout();
    return null;
  }
};
