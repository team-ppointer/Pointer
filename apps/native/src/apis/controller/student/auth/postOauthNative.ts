import { client } from '@/apis/client';
import { components } from '@schema';

const postOauthNative = async (data: {
    provider: "KAKAO" | "GOOGLE" | "APPLE";
    token: string;
  }) => {
  return await client.POST('/api/student/oauth/native', {
    body: data,
  });
};

export default postOauthNative;
