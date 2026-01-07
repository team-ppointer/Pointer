import { client } from '@/apis/client';

const postPhoneSend = async (
  phone: string,
  purpose?: string,
) => {
  return await client.POST('/api/auth/phone/send', {
    body: {
      phone,
      purpose,
    },
  });
};

export default postPhoneSend;
