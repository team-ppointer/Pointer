import createFetchClient from 'openapi-fetch';

import { paths } from '@schema';
import { env } from '@utils';

// Middleware-free client for bootstrap/auth flows that must bypass authMiddleware
export const bareClient = createFetchClient<paths>({
  baseUrl: env.apiBaseUrl,
});
