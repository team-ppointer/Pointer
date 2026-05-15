import { Platform } from 'react-native';

import { env } from '@utils';
import { client } from '@apis/client';

const getRedirectUri = () => {
  if (Platform.OS === 'web') {
    return `${window.location.origin}/auth/callback`;
  }

  return env.authRedirectUri;
};

const postSocialLogin = async (social: 'KAKAO' | 'GOOGLE') => {
  const response = await client.POST('/api/student/auth/login/social', {
    body: {
      provider: social,
      redirectUri: getRedirectUri(),
    },
  });

  if (response.data) {
    return { isSuccess: true, loginUrl: response.data.loginUrl };
  }
  return { isSuccess: false, error: '데이터를 찾을 수 없습니다.' };
};

export default postSocialLogin;
