import { TanstackQueryClient } from '@apis';

const useGetNotice = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/notice');
};

export default useGetNotice;
