import { TanstackQueryClient } from '@apis';

const useGetProblemsByPublishId = (id: string) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/publish/detail/{id}',
    {
      params: {
        path: {
          id: +id,
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
