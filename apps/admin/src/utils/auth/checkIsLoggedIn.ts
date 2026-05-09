import { adminSessionStorage } from './adminSessionStorage';
import { tokenStorage } from './tokenStorage';
import { reissueToken } from './reissueToken';

// 페이지 로드 후 1회 강제로 세션을 갱신해 서버 측 권한/만료 변경을 반영한다.
let hasBootRefreshed = false;

// 로그인 상태를 확인하는 함수
export const checkIsLoggedIn = async (): Promise<boolean> => {
  let accessToken = tokenStorage.getToken();
  const session = adminSessionStorage.getSession();

  // 액세스 토큰이나 세션 정보가 없으면 리프레시 토큰으로 재발급 시도 (실패 시 강제 로그아웃)
  if (!accessToken || !session) {
    try {
      accessToken = await reissueToken();
      if (!accessToken) {
        console.warn('Token reissue failed, user needs to login again');
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Error during token reissue:', error);
      return false;
    }
  }

  // 로컬 세션이 살아 있더라도 부팅 시 1회 서버에 세션을 재확인.
  // 서버 측 권한/만료 변경을 잡되, 일시적인 네트워크 오류로 사용자를 즉시 로그아웃시키지는 않는다.
  if (!hasBootRefreshed) {
    hasBootRefreshed = true;
    try {
      const refreshed = await reissueToken({ silentLogoutOnFail: false });
      if (refreshed) {
        return true;
      }
      // 갱신 실패 시 로컬 토큰이 남아 있으면 일단 진입 허용 (다음 401에서 미들웨어가 처리)
      return !!tokenStorage.getToken();
    } catch (error) {
      console.warn('Boot token refresh failed:', error);
      return !!tokenStorage.getToken();
    }
  }

  return !!accessToken;
};
