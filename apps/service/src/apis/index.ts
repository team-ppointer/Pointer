import { client, TanstackQueryClient } from './client';

export { client, TanstackQueryClient };

// controllers
export * from './controller/auth';
export * from './controller/home';
export * from './controller/problem';
export * from './controller/submit';
export * from './controller/qna';
export * from './controller/file/fileUpload';
export * from './controller-teacher/auth';
export * from './controller-teacher/qna';
