import { client } from '@/apis/client';
import { type components } from '@schema';

type PasswordResetDTOSendCodeRequest = components['schemas']['PasswordResetDTO.SendCodeRequest'];
const postPasswordResetSendCode = async (data: PasswordResetDTOSendCodeRequest) => {
  return await client.POST('/api/student/auth/password/reset/send-code', {
    body: data,
  });
};

export default postPasswordResetSendCode;
