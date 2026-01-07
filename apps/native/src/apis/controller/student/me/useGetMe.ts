import { TanstackQueryClient } from '@/apis/client';

const useGetMe = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/me');
};

export default useGetMe;
