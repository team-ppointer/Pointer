import { bareClient } from '@apis/bareClient';
import { getRefreshToken, setAccessToken, setRefreshToken } from '@utils/auth';
import type { components } from '@schema';

type StudentTokenResp = components['schemas']['StudentTokenResp'];

type RefreshResult =
  | { success: true; data: StudentTokenResp }
  | { success: false; transient: boolean };

const refreshAndPersistTokens = async (): Promise<RefreshResult> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return { success: false, transient: false };

  try {
    const { data, error, response } = await bareClient.POST('/api/student/auth/refresh', {
      body: { refreshToken },
    });

    if (error || !data) {
      // 5xx 는 서버 장애로 해석하고 자격증명을 보존한다. 4xx (401/403 등)
      // 는 refresh token 자체 만료/무효로 보고 호출 측이 로그아웃 처리한다.
      const status = (response as Response | undefined)?.status;
      const transient = status === undefined || status >= 500;
      return { success: false, transient };
    }

    if (data.token.accessToken) {
      await setAccessToken(data.token.accessToken);
    }
    if (data.token.refreshToken) {
      await setRefreshToken(data.token.refreshToken);
    }

    return { success: true, data };
  } catch {
    return { success: false, transient: true };
  }
};

export default refreshAndPersistTokens;
