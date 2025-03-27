import { fetchClient } from '@apis';

const postLogin = async (email: string, password: string) => {
  return await fetchClient.POST('/api/v1/auth/admin/login', {
    body: {
      email,
      password,
    },
  });
};

export default postLogin;
