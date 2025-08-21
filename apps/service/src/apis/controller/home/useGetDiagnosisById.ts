import { TanstackQueryClient } from '@apis';

const useGetDiagnosisById = (id: number) => {
  return TanstackQueryClient.useQuery('get', '/api/student/diagnosis/detail/{id}', {
    params: {
      path: { id },
    },
  });
};

export default useGetDiagnosisById;