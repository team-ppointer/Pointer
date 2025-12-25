import { client } from '@apis';

const postPushToken = async (fcmToken: string) => {
  return await client.POST('/api/student/me/push/token', {
    body: {
      fcmToken,
    },
  });
};

export default postPushToken;
