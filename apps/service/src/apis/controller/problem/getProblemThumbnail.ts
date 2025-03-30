import { TanstackQueryClient } from '@apis';

const useGetProblemThumbnail = (publishId: string, problemId: string) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/v1/client/problem/thumbnail/{publishId}/{problemId}',
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

export default useGetProblemThumbnail;
