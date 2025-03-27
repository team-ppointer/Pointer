import { TanstackQueryClient } from '@/apis/client';

const getChildProblemById = (publishId: string, problemId: string, childProblemId: string) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/v1/client/problem/{publishId}/{problemId}/{childProblemId}',
    {
      params: {
        path: {
          publishId: Number(publishId),
          problemId: Number(problemId),
          childProblemId: Number(childProblemId),
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default getChildProblemById;
