import { client } from '@/apis/client';

const postPhoneResend = async (
  phone: string,
  purpose?: string,
) => {
  return await client.POST('/api/auth/phone/resend', {
    body: {
      phone,
      purpose,
    },
  });
};

export default postPhoneResend;
