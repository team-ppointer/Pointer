import { bareClient } from '@apis/bareClient';
import { getRefreshToken } from '@utils';

const postRefreshToken = async () => {
  try {
    const { data, error } = await bareClient.POST('/api/student/auth/refresh', {
      body: {
        refreshToken: getRefreshToken() ?? '',
      },
    });

    if (error || !data) throw new Error('Refresh failed');

    return { isSuccess: true, data };
  } catch (e) {
    return { isSuccess: false, error: e };
  }
};

export default postRefreshToken;
