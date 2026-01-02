import { client } from '@apis';

const postAllowPush = async () => {
  return await client.POST('/api/student/me/push/allow/toggle');
};

export default postAllowPush;
