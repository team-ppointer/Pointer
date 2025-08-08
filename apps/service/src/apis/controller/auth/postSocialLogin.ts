'use client';

import { client } from '@/apis/client';

const postSocialLogin = async (social: 'KAKAO' | 'GOOGLE') => {
  const response = await client.POST('/api/student/auth/login/social', {
    body: {
      provider: social,
      redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI ?? '',
    },
  });

  try {
    if (response && response.data) {
      return { isSuccess: true, loginUrl: response.data.loginUrl };
    } else {
      return { isSuccess: false, error: '데이터를 찾을 수 없습니다.' };
    }
  } catch (error) {
    return { isSuccess: false, error: error };
  }
};

export default postSocialLogin;
