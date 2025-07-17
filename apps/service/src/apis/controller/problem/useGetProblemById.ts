import { TanstackQueryClient } from '@apis';

const useGetProblemById = (problemId: number | null) => {
  if (problemId === null) {
    return null;
  }

  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/problem/{id}',
    {
      params: {
        path: {
          id: problemId,
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
