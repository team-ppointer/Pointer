import { client } from '@apis';

const getProblemsByPublishId = async (publishId: string) => {
  const { data } = await client.GET('/api/v1/client/problem/{publishId}', {
    params: {
      path: {
        publishId: Number(publishId),
      },
    },
  });
  return data?.data ?? {};
};

export default getProblemsByPublishId;
