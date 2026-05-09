import { Middleware } from 'openapi-fetch';
import { enforceSession, tokenStorage } from '@utils';

const UNPROTECTED_ROUTES = ['/api/admin/auth/login/local'];

const authMiddleware: Middleware = {
  async onRequest({ schemaPath, request }: { schemaPath: string; request: Request }) {
    if (UNPROTECTED_ROUTES.some((pathname) => schemaPath.startsWith(pathname))) {
      return undefined;
    }

    let accessToken = tokenStorage.getToken();

    if (!accessToken) {
      try {
        accessToken = await enforceSession();

        if (!accessToken) {
          console.error('Access token reissue failed. User needs to login again.');
          return request;
        }
      } catch (error) {
        console.error('Error during token reissue in middleware:', error);
        return request;
      }
    }

    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },

  async onResponse({ request, response }) {
    if (response.status === 401) {
      console.warn('Access token expired. Attempting reissue...');

      try {
        const newAccessToken = await enforceSession();

        if (!newAccessToken) {
          console.error('Token reissue failed. User needs to login again.');
          return response;
        }

        request.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return fetch(request);
      } catch (error) {
        console.error('Error during token reissue in response handler:', error);
        return response;
      }
    }
    return response;
  },
};

export default authMiddleware;
