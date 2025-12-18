import { client, TanstackQueryClient } from './client';
import authMiddleware from './authMiddleware';

export { client, TanstackQueryClient, authMiddleware };

// controllers
export * from './controller/auth';
export * from './controller/diagnosis';
export * from './controller/notice';
export * from './controller/scrap';
export * from './controller/study';
