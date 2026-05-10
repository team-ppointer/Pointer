import { adminSessionStorage } from './adminSessionStorage';
import { resetBootRefresh } from './bootRefresh';
import { tokenStorage } from './tokenStorage';

import { queryClient } from '@/queryClient';

const clearAuthLocalStorage = () => {
  tokenStorage.clearToken();
  adminSessionStorage.clearSession();
  // 다음 로그인 직후 부팅 갱신이 다시 한 번 일어나도록 플래그도 초기화한다.
  resetBootRefresh();
};

export const logout = (): void => {
  clearAuthLocalStorage();
  // 다른 계정 로그인 시 이전 계정의 캐시가 잠깐 노출되지 않도록 비운다.
  queryClient.clear();
  window.location.href = '/login';
};

// mount 된 React 트리가 살아 있는 상태에서 호출되므로 queryClient.clear() 는
// 부르지 않는다. clear() 는 staleTime: Infinity 환경의 active observer 들이
// 즉시 refetch 를 시도하게 만들어, 토큰이 비워진 직후 새 401 → enforceSession
// → 또 다른 refresh 시도라는 짧은 루프를 만들 수 있다. 캐시 정리는 redirect
// 책임을 가진 caller 가 직접 수행한다.
export const silentLogout = (): void => {
  clearAuthLocalStorage();
};
