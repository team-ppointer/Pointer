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

export default postKakaoAccessToken;
