import { TanstackQueryClient } from '@/apis/client';

const useGetNoticeCount = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/notice/count');
};

export default useGetNoticeCount;
