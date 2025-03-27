import { client } from '@apis';

const postLogin = async (email: string, password: string) => {
  return await client.POST('/api/v1/auth/admin/login', {
    body: {
      email,
      password,
    },
  });
};

export default postLogin;
