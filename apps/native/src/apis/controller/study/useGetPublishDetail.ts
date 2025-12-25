import { TanstackQueryClient } from '@apis';

const useGetPublishDetail = (id: number) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/study/publish/detail/{id}',
    {
      params: {
        path: {
          id,
        },
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetPublishDetail;
