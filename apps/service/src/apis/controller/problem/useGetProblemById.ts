import { TanstackQueryClient } from '@apis';

const useGetProblemById = (publishId: number, problemId: number) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/problem/{publishId}/{problemId}',
    {
      params: {
        path: {
          publishId: publishId,
          problemId: problemId,
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetProblemById;
