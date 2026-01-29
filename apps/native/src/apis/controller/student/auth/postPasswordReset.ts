import { client } from '@/apis/client';
import { components } from '@schema';

type PasswordResetDTOResetPasswordRequest =
  components['schemas']['PasswordResetDTO.ResetPasswordRequest'];
const postPasswordReset = async (data: PasswordResetDTOResetPasswordRequest) => {
  return await client.POST('/api/student/auth/password/reset', {
    body: data,
  });
};

export default postPasswordReset;
