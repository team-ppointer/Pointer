import { client } from '@/apis/client';
import { type components } from '@schema';

type PasswordResetDTOResetPasswordRequest =
  components['schemas']['PasswordResetDTO.ResetPasswordRequest'];
const postPasswordResetVerifyCode = async (data: PasswordResetDTOResetPasswordRequest) => {
  return await client.POST('/api/student/auth/password/reset/verify-code', {
    body: data,
  });
};

export default postPasswordResetVerifyCode;
