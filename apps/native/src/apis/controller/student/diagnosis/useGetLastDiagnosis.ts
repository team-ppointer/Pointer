import { TanstackQueryClient } from '@apis';

const useGetLastDiagnosis = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/diagnosis/last');
};

export default useGetLastDiagnosis;