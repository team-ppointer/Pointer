import { getAccessToken } from '@contexts/AuthContext';

import { reissueToken } from './reissueToken';

// 로그인 상태를 확인하는 함수
export const checkIsLoggedIn = async (): Promise<boolean> => {
  // 액세스 토큰이 있으면 로그인된 것으로 간주
  let accessToken = getAccessToken();

  // 액세스 토큰이 없으면 리프레시 토큰으로 재발급 시도
  if (!accessToken) {
    accessToken = await reissueToken();
  }

  return !!accessToken;
};
