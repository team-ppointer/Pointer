import { client } from '@apis';

const getProblemThumbnail = async (publishId: string, problemId: string) => {
  const { data } = await client.GET('/api/v1/client/problem/thumbnail/{publishId}/{problemId}', {
    params: {
      path: {
        publishId: Number(publishId),
        problemId: Number(problemId),
      },
    },
  });
  return data?.data ?? {};
};

export default getProblemThumbnail;
