import { client, TanstackQueryClient } from './client';
import authMiddleware from './authMiddleware';

export { client, TanstackQueryClient, authMiddleware };

// controllers

export * from './controller/qna';
export * from './controller/scrap';
export * from './controller/student';
