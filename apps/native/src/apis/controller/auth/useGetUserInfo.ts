import { TanstackQueryClient } from '@/apis/client';

const useGetUserInfo = (type: 'teacher' | 'student') => {
  return TanstackQueryClient.useQuery('get', '/api/student/me', {
    enabled: type === 'student',
  });
};

export default useGetUserInfo;
