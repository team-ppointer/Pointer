'use client';

const postRefreshToken = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/common/auth/refresh`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    return { isSuccess: true, data };
  } catch (e) {
    return { isSuccess: false, error: e };
  }
};

export default postRefreshToken;
