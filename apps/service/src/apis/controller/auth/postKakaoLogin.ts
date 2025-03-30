'use client';

import { setAccessToken, setName } from '@utils';
import { client } from '@/apis/client';

const postKakaoAccessToken = async (code: string) => {
  const response = await fetch(`https://kauth.kakao.com/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: `grant_type=authorization_code&client_id=${process.env.NEXT_PUBLIC_REST_API_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&code=${code}`,
  });
  const jsonData = await response.json();
  return jsonData.access_token;
};

const postKakaoLogin = async (code: string) => {
  const accessToken = await postKakaoAccessToken(code);
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

  try {
    if (
      response &&
      response.data &&
      response.data.data &&
      response.data.data.name &&
      response.data.data.accessToken
    ) {
      const { accessToken, name } = response.data.data;
      setAccessToken(accessToken);
      setName(name);

      window.location.href = '/';
    } else {
      console.error('accessToken을 찾을 수 없습니다:', response);
    }
  } catch (error) {
    console.error('소셜 로그인 요청 오류:', error);
  }

  return response;
};

export default postKakaoLogin;
