import { client, TanstackQueryClient } from './client';
import authMiddleware from './authMiddleware';

export { client, TanstackQueryClient, authMiddleware };

// controllers
export * from './controller/common';
export * from './controller/student';
