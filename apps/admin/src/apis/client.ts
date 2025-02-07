import { paths } from '@schema';
import createClient from 'openapi-fetch';

export const client = createClient<paths>({ baseUrl: import.meta.env.VITE_API_BASE_URL });
