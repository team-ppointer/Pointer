import { adminSessionStorage } from './adminSessionStorage';
import { resetBootRefresh } from './bootRefresh';
import { tokenStorage } from './tokenStorage';

const clearLocalAuthState = () => {
  tokenStorage.clearToken();
  adminSessionStorage.clearSession();
  // 다음 로그인 직후 부팅 갱신이 다시 한 번 일어나도록 플래그도 초기화한다.
  resetBootRefresh();
};

export const logout = (): void => {
  clearLocalAuthState();
  window.location.href = '/login';
};

export const silentLogout = (): void => {
  clearLocalAuthState();
};
