import { tokenStorage } from './tokenStorage';
import { silentLogout } from './logout';

// 리프레시 토큰을 이용한 액세스 토큰 재발급
export const reissueToken = async () => {
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
        console.log('Refresh token expired, user needs to login again');
      }
      throw new Error(`Token reissue failed with status: ${response.status}`);
    }

    const data = await response.json();
    const accessToken = data.token.accessToken;
    tokenStorage.setToken(accessToken);
    return accessToken;
  } catch (error) {
    console.error('Reissue failed:', error);
    silentLogout();
    return null;
  }
};
