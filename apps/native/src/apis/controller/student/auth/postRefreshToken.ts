import { bareClient } from '@apis/bareClient';
import { getRefreshToken } from '@utils';

const postRefreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return { isSuccess: false, error: new Error('No refresh token') };

  try {
    const { data, error } = await bareClient.POST('/api/student/auth/refresh', {
      body: { refreshToken },
    });

    if (error || !data) throw new Error('Refresh failed');

    return { isSuccess: true, data };
  } catch (e) {
    return { isSuccess: false, error: e };
  }
};

export default postRefreshToken;
