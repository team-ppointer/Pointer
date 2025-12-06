import { client } from '@apis';

const deleteAccount = async () => {
  return await client.DELETE('/api/student/auth/quit');
};

export default deleteAccount;
