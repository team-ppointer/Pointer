import { adminSessionStorage } from './adminSessionStorage';
import { isBootRefreshed, markBootRefreshed } from './bootRefresh';
import { enforceSession, refreshSession } from './session';
import { tokenStorage } from './tokenStorage';

// 로그인 상태를 확인하는 함수
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
  // 일시적인 네트워크 오류로 사용자를 즉시 로그아웃시키지 않기 위해
  // refreshSession (graceful) 을 사용한다.
  if (!isBootRefreshed()) {
    markBootRefreshed();
    const refreshed = await refreshSession();
    if (refreshed) return true;
    return !!tokenStorage.getToken();
  }

  return !!accessToken;
};
