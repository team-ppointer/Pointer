import { adminSessionStorage } from './adminSessionStorage';
import { isBootRefreshed, markBootRefreshed } from './bootRefresh';
import { enforceSession, refreshSession } from './session';
import { silentLogout } from './logout';
import { tokenStorage } from './tokenStorage';

export const checkIsLoggedIn = async (): Promise<boolean> => {
  const accessToken = tokenStorage.getToken();
  const session = adminSessionStorage.getSession();

  // 액세스 토큰이나 세션 정보가 없으면 강제 재발급 (실패 시 로컬 상태 정리)
  if (!accessToken || !session) {
    const refreshed = await enforceSession();
    if (!refreshed) {
      console.warn('Session enforcement failed, user needs to login again');
      return false;
    }
    return true;
  }

  // 로컬 세션이 살아 있더라도 부팅 시 1회 서버에 세션을 재확인.
  // - ok: 정상 진입
  // - unauthorized: refresh 토큰이 만료된 케이스이므로 즉시 로컬 상태 정리
  // - transient: 네트워크/5xx 일 수 있어 기존 로컬 토큰 유지하고 진입 허용
  if (!isBootRefreshed()) {
    markBootRefreshed();
    const result = await refreshSession();
    if (result.kind === 'ok') return true;
    if (result.kind === 'unauthorized') {
      silentLogout();
      return false;
    }
    return !!tokenStorage.getToken();
  }

  return !!accessToken;
};
