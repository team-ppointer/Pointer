import { bareClient } from '@apis/bareClient';
import { getRefreshToken, setAccessToken, setRefreshToken } from '@utils/auth';
import type { components } from '@schema';

type StudentTokenResp = components['schemas']['StudentTokenResp'];

type RefreshResult = { success: true; data: StudentTokenResp } | { success: false };

const refreshAndPersistTokens = async (): Promise<RefreshResult> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return { success: false };

  try {
    const { data, error } = await bareClient.POST('/api/student/auth/refresh', {
      body: { refreshToken },
    });

    if (error || !data) return { success: false };

    if (data.token.accessToken) {
      await setAccessToken(data.token.accessToken);
    }
    if (data.token.refreshToken) {
      await setRefreshToken(data.token.refreshToken);
    }

    return { success: true, data };
  } catch {
    return { success: false };
  }
};

export default refreshAndPersistTokens;
