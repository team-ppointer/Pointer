import { client } from '@apis';

const postChangePassword = async (newPassword: string) => {
  return await client.POST('/api/student/me/password', {
    body: {
      newPassword,
    },
  });
};

export default postChangePassword;
