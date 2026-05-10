import { adminSessionStorage } from './adminSessionStorage';
import { resetBootRefresh } from './bootRefresh';
import { tokenStorage } from './tokenStorage';

import { queryClient } from '@/queryClient';

const clearLocalAuthState = () => {
  tokenStorage.clearToken();
  adminSessionStorage.clearSession();
  // 다른 계정 로그인 시 이전 계정의 캐시(예: getUserList) 가 잠깐 노출되지 않도록 비운다.
  queryClient.clear();
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
