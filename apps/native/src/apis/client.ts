import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import { paths } from '@schema';
import { env } from '@utils';
export const client = createFetchClient<paths>({
  baseUrl: env.apiBaseUrl,
});

export const TanstackQueryClient = createClient(client);
