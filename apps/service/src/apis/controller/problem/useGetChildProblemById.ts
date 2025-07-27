import { TanstackQueryClient } from '@apis';

const useGetChildProblemById = (publishId: number, childProblemId: number) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/child-problem/{publishId}/{problemId}',
    {
      params: {
        path: {
          publishId: publishId,
          problemId: childProblemId,
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetChildProblemById;
