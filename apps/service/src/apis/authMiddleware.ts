'use client';
import { Middleware } from 'openapi-fetch';

import { getAccessToken, setAccessToken } from '@/contexts/AuthContext';

const UNPROTECTED_ROUTES = ['/api/v1/auth/admin/login'];

const reissueToken = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/reissue`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Token reissue failed');

    const data = await response.json();
    const accessToken = data.data.accessToken;
    setAccessToken(accessToken);
    return accessToken;
  } catch (error) {
    console.error('Reissue failed:', error);
    setAccessToken(null);
    window.location.href = '/login';
    return null;
  }
};

const authMiddleware: Middleware = {
  async onRequest({ schemaPath, request }: { schemaPath: string; request: Request }) {
    if (UNPROTECTED_ROUTES.some((pathname) => schemaPath.startsWith(pathname))) {
      return undefined;
    }

    let accessToken = getAccessToken();

    if (!accessToken) {
      accessToken = await reissueToken();

      if (!accessToken) {
        console.error('Access token reissue failed. Logging out...');
        return request;
      }
    }

    request.headers.set('Authorization', `Bearer ${accessToken}`);
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
