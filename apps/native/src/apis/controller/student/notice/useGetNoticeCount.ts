import { TanstackQueryClient } from '@apis';

const useGetNoticeCount = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/notice/count');
};

export default useGetNoticeCount;
