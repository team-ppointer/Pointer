import { client, authMiddleware } from '@apis';

client.use(authMiddleware);
