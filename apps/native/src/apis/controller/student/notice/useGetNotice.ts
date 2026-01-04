import { TanstackQueryClient } from '@/apis/client';

const useGetNotice = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/notice');
};

export default useGetNotice;
