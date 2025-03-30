import { TanstackQueryClient } from '@apis';

const useGetChildData = (publishId: string, problemId: string) => {
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
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetChildData;
