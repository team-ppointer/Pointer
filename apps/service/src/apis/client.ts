import { paths } from '@schema';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

const client = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {},
});

export const $api = createClient(client);
