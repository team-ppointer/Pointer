import { Middleware } from 'openapi-fetch';
import { enforceSession, tokenStorage } from '@utils';

const UNPROTECTED_ROUTES = ['/api/admin/auth/login/local'];

// 동시 요청들이 동시에 401 을 받아도 navigation 은 한 번만 일어나게 한다.
let hasRedirected = false;

const redirectToLogin = () => {
  if (hasRedirected) return;
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    hasRedirected = true;
    window.location.href = '/login';
  }
};

const authMiddleware: Middleware = {
  async onRequest({ schemaPath, request }: { schemaPath: string; request: Request }) {
    if (UNPROTECTED_ROUTES.some((pathname) => schemaPath.startsWith(pathname))) {
      return undefined;
    }

    let accessToken = tokenStorage.getToken();

    if (!accessToken) {
      accessToken = await enforceSession();
      if (!accessToken) {
        console.warn('Access token reissue failed. Redirecting to login.');
        redirectToLogin();
        return request;
      }
    }

    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },

  async onResponse({ request, response }) {
    if (response.status === 401) {
      console.warn('Access token expired. Attempting reissue...');

      const newAccessToken = await enforceSession();

      if (!newAccessToken) {
        console.warn('Token reissue failed. Redirecting to login.');
        redirectToLogin();
        return response;
      }

      request.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return fetch(request);
    }
    return response;
  },
};

export default authMiddleware;
