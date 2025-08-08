import { TanstackQueryClient } from '@apis';

const useGetNoticeUnreadCount = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/notice/count');
};

export default useGetNoticeUnreadCount;
