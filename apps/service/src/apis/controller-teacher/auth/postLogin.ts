import { client } from '@/apis/client';

const postLogin = async (data: { email: string; password: string }) => {
  return client.POST('/api/teacher/auth/login/local', {
    body: data,
  });
};

export default postLogin;
