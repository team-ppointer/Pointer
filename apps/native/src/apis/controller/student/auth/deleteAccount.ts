import { client } from '@/apis/client';
import { type paths } from '@/types/api/schema';

type QuitRequest =
  paths['/api/student/auth/quit']['post']['requestBody']['content']['application/json'];

const deleteAccount = async (request: QuitRequest) => {
  return await client.POST('/api/student/auth/quit', {
    body: request,
  });
};

export default deleteAccount;
