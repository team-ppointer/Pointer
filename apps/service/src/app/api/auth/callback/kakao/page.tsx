import { postKakaoAccessToken, postKakaoLogin } from '@apis';
import { redirect } from 'next/navigation';

import { setAccessToken } from '@/contexts/AuthContext';

const Page = async ({ searchParams }: { searchParams: Promise<{ code: string }> }) => {
  const { code } = await searchParams;

  try {
    if (code) {
      const kakaoAccessToken = await postKakaoAccessToken(code);
      console.log('kakaoAccessToken', kakaoAccessToken);

      if (kakaoAccessToken) {
        try {
          const response = await postKakaoLogin(kakaoAccessToken);
          console.log('응답 데이터:', response);

          if (response && response.data && response.data.data && response.data.data.accessToken) {
            setAccessToken(response.data.data.accessToken);
            redirect('/');
          } else {
            console.error('accessToken을 찾을 수 없습니다:', response);
          }
        } catch (error) {
          console.error('소셜 로그인 요청 오류:', error);
        }
      }
    }
  } catch (error) {
    console.error('카카오 토큰 요청 오류:', error);
  }

  return <div>code: {code}</div>;
};

export default Page;
