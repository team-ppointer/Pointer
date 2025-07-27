import { TanstackQueryClient } from '@/apis/client';

const useGetUserInfo = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/me');
};

export default useGetUserInfo;
