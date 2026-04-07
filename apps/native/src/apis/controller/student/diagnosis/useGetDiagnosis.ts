import { TanstackQueryClient } from '@/apis/client';

const useGetDiagnosis = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/diagnosis');
};

export default useGetDiagnosis;
