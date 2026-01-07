import { TanstackQueryClient } from '@/apis/client';

const useGetDiagnosisDetail = (id: number) => {
  return TanstackQueryClient.useQuery('get', '/api/student/diagnosis/detail/{id}', {
    params: {
      path: { id },
    },
  });
};

export default useGetDiagnosisDetail;