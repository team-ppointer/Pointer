import { paths } from '@schema';
import createFetchClient, { Middleware } from 'openapi-fetch';
import createClient from 'openapi-react-query';

const UNPROTECTED_ROUTES = ['/api/v1/auth/admin/login'];
let accessToken: string | null = localStorage.getItem('accessToken');

const authMiddleware: Middleware = {
  async onRequest({ schemaPath, request }: { schemaPath: string; request: Request }) {
    if (UNPROTECTED_ROUTES.some((pathname) => schemaPath.startsWith(pathname))) {
      return undefined;
    }

    if (!accessToken) {
      const localStorageAccessToken = localStorage.getItem('accessToken');
      if (localStorageAccessToken) {
        accessToken = localStorageAccessToken;
      } else {
        // handle auth error
      }
    }

    // (optional) add logic here to refresh token when it expires

    // add Authorization header to every request
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },
};

const client = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
});
client.use(authMiddleware);

export const $api = createClient(client);
