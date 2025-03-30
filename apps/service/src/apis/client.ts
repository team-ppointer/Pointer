import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import { paths } from '@schema';

export const client = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const TanstackQueryClient = createClient(client);
