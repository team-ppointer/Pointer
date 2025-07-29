import { TanstackQueryClient } from '@apis';

const useGetProblemsTeacherByPublishId = (id: string) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/teacher/study/publish/detail/{id}',
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

export default useGetProblemsTeacherByPublishId;
