import { client } from '@/apis/client';

const postPhoneVerify = async (phone: string, code: string, purpose?: string) => {
  return await client.POST('/api/auth/phone/verify', {
    body: {
      phone,
      purpose,
      code,
    },
  });
};

export default postPhoneVerify;
