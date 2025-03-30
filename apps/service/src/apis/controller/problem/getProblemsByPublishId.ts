import { TanstackQueryClient } from '@apis';

const useGetProblemsByPublishId = (publishId: string) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/v1/client/problem/{publishId}',
    {
      params: {
        path: {
          publishId: Number(publishId),
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetProblemsByPublishId;
