import { client } from '@/apis/client';

const getProblemById = async (publishId: string, problemId: string) => {
  const { data } = await client.GET('/api/v1/client/problem/{publishId}/{problemId}', {
    params: {
      path: {
        publishId: Number(publishId),
        problemId: Number(problemId),
      },
    },
  });

  return data?.data;
};

export default getProblemById;
