import { Middleware } from 'openapi-fetch';
import { refreshSession, silentLogout, tokenStorage } from '@utils';

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

const refreshAccessTokenForAuth = async (): Promise<string | null> => {
  const result = await refreshSession();
  if (result.kind === 'ok') return result.accessToken;

  if (result.kind === 'unauthorized') {
    silentLogout();
    redirectToLogin();
  }

  return null;
};

const authMiddleware: Middleware = {
  async onRequest({ schemaPath, request }: { schemaPath: string; request: Request }) {
    if (UNPROTECTED_ROUTES.some((pathname) => schemaPath.startsWith(pathname))) {
      return undefined;
    }

    let accessToken = tokenStorage.getToken();

    if (!accessToken) {
      accessToken = await refreshAccessTokenForAuth();
      if (!accessToken) {
        // 인증 헤더 없이 요청을 보내면 서버가 401 을 또 주고 onResponse 가
        // 다시 refresh 를 시도하게 된다. 명시적으로 throw 해 호출 자체를 abort.
        throw new Error('Authentication required');
      }
    }

    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },

  async onResponse({ request, response }) {
    if (response.status === 401) {
      console.warn('Access token expired. Attempting reissue...');

      const newAccessToken = await refreshAccessTokenForAuth();

      if (!newAccessToken) {
        return response;
      }

      request.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return fetch(request);
    }
    return response;
  },
};

export default authMiddleware;
