import { client } from '@/apis';
import authMiddleware from '@/apis/authMiddleware';

client.use(authMiddleware);

