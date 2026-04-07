import { type components } from '@schema';
import { client } from '@/apis/client';

type PasswordResetDTOVerifyCodeRequest =
  components['schemas']['PasswordResetDTO.VerifyCodeRequest'];
const postPasswordResetVerifyCode = async (data: PasswordResetDTOVerifyCodeRequest) => {
  return await client.POST('/api/student/auth/password/reset/verify-code', {
    body: data,
  });
};

export default postPasswordResetVerifyCode;
