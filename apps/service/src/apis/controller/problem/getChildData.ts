import { TanstackQueryClient } from '@/apis/client';

const getChildData = (publishId: string, problemId: string) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/v1/client/problem/child/{publishId}/{problemId}',
    {
      params: {
        path: {
          publishId: Number(publishId),
          problemId: Number(problemId),
        },
      },
    }
  );
};

export default getChildData;
