import { TanstackQueryClient } from '@/apis/client';

const useGetLastDiagnosis = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/diagnosis/last');
};

export default useGetLastDiagnosis;