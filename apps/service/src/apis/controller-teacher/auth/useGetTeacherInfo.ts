import { TanstackQueryClient } from '@/apis/client';

const useGetTeacherInfo = (type: 'teacher' | 'student') => {
  return TanstackQueryClient.useQuery('get', '/api/teacher/me', {
    enabled: type === 'teacher',
  });
};

export default useGetTeacherInfo;
