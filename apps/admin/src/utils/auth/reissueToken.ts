import { tokenStorage } from './tokenStorage';

// 리프레시 토큰을 이용한 액세스 토큰 재발급
export const reissueToken = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/reissue`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Token reissue failed');

    const data = await response.json();
    const accessToken = data.data.accessToken;
    tokenStorage.setToken(accessToken);
    return accessToken;
  } catch (error) {
    console.error('Reissue failed:', error);
    tokenStorage.clearToken();
    window.location.href = '/login';
    return null;
  }
};
