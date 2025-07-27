'use client';
import { Middleware } from 'openapi-fetch';

import { getAccessToken, setAccessToken, setGrade, setName, setRefreshToken } from '@utils';
import { postRefreshToken } from '@/apis/controller/auth';

const UNPROTECTED_ROUTES = ['/api/student/auth/login/social', '/api/common/auth/refresh'];

const reissueToken = async () => {
  let accessToken = getAccessToken();

  if (accessToken) {
    return accessToken;
  }

  const result = await postRefreshToken();

  if (!result.isSuccess || !result.data) {
    console.error('액세스토큰 갱신 실패:', result.error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    return null;
  }

  if (result.data?.token.accessToken) {
    setAccessToken(result.data.token.accessToken);
    accessToken = result.data.token.accessToken;
  }
  if (result.data?.token.refreshToken) {
    setRefreshToken(result.data.token.refreshToken);
  }
  if (result.data?.name) {
    setName(result.data.name);
    setGrade(result.data.grade);
  }
  return accessToken;
};

const authMiddleware: Middleware = {
  async onRequest({ schemaPath, request }: { schemaPath: string; request: Request }) {
    if (UNPROTECTED_ROUTES.some((pathname) => schemaPath.startsWith(pathname))) {
      return undefined;
    }

    const accessToken = await reissueToken();

    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return request;
  },

  async onResponse({ request, response }) {
    if (response.status === 401) {
      console.warn('Access token expired. Attempting reissue...');

      const newAccessToken = await reissueToken();

      if (!newAccessToken) {
        console.error('Reissue failed. Logging out...');
        return response;
      }

      request.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return fetch(request);
    }
    return response;
  },
};

export default authMiddleware;
