import { TanstackQueryClient } from '@apis';

const useGetDiagnosis = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/diagnosis');
};

export default useGetDiagnosis;