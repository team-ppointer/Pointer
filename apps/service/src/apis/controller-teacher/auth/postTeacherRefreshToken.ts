import { getTeacherRefreshToken } from '@utils';

const postTeacherRefreshToken = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/teacher/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: getTeacherRefreshToken(),
      }),
    });
    if (!res.ok) throw new Error('Teacher refresh failed');

    const data = await res.json();
    return { isSuccess: true, data };
  } catch (e) {
    return { isSuccess: false, error: e };
  }
};
export default postTeacherRefreshToken;
