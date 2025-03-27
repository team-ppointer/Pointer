import { paths } from '@schema';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

export const client = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const TanstackQueryClient = createClient(client);
