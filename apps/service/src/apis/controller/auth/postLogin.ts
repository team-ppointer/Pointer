import { client } from '@apis';

const postLogin = async (email: string, password: string) => {
  return await client.POST('/api/v1/auth/admin/login', {
    body: {
      email,
      password,
    },
    credentials: 'include',
  });
};

export default postLogin;
