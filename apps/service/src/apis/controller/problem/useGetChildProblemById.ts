import { TanstackQueryClient } from '@apis';

const useGetChildProblemById = (childProblemId: number | null) => {
  if (childProblemId === null) {
    return null;
  }

  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/child-problem/{id}',
    {
      params: {
        path: {
          id: childProblemId,
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
