import { TanstackQueryClient } from '@apis';

const useGetMe = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/me');
};

export default useGetMe;
