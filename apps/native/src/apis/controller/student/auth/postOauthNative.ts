import { env } from '@utils';

export type OAuthNativeRequest = {
  provider: 'KAKAO' | 'GOOGLE' | 'APPLE';
  token: string;
};

export type OAuthNativeUser = {
  id: number;
  email: string;
  name: string;
  nickname: string;
  birth: string;
  gender: 'MALE' | 'FEMALE';
  grade: string;
  selectSubject: string;
  level: number;
  provider: 'KAKAO' | 'GOOGLE' | 'APPLE';
  isFirstLogin: boolean;
  teacherId: number | null;
};

export type OAuthNativeResponse = {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: OAuthNativeUser;
};

const postOauthNative = async (data: OAuthNativeRequest): Promise<OAuthNativeResponse> => {
  const response = await fetch(`${env.apiBaseUrl}/api/student/oauth/native`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result as OAuthNativeResponse;
};

export default postOauthNative;
