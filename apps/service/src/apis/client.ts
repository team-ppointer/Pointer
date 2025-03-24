import { paths } from '@schema';
import createFetchClient from 'openapi-fetch';

const client = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {},
});

export default client;
