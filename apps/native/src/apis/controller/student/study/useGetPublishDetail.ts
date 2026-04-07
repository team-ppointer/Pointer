import { TanstackQueryClient } from '@/apis/client';

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
      enabled: id > 0,
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetPublishDetail;
