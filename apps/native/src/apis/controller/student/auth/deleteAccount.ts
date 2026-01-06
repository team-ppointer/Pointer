import { client } from '@/apis/client';

const deleteAccount = async () => {
  return await client.DELETE('/api/student/auth/quit');
};

export default deleteAccount;
