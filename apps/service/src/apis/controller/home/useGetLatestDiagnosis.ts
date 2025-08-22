import { TanstackQueryClient } from '@apis';

const useGetLatestDiagnosis = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/diagnosis/last');
};

export default useGetLatestDiagnosis;