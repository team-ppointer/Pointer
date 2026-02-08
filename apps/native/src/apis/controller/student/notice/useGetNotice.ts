import { TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type UseGetNoticeParams = paths['/api/student/notice']['get']['parameters']['query'];

const useGetNotice = (params?: UseGetNoticeParams) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/notice',
    {
      params: {
        query: params,
      },
    },
    {
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );
};

export default useGetNotice;
