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
      enabled: problemId >= 0 && publishId >= 0,
    }
  );
};

export default useGetProblemById;
