import { client } from '@/apis/client';

const postKakaoLogin = async (accessToken: string) => {
  const response = await client.POST('/api/v1/auth/oauth/social-login', {
    params: {
      header: {
        social_access_token: accessToken,
      },
      query: {
        provider: 'KAKAO',
      },
    },
  });
  return response;
};

export default postKakaoLogin;
