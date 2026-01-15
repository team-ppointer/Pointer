import { useQuery } from '@tanstack/react-query';
import { client } from '@/apis/client';

const useGetLastDiagnosis = () => {
  return useQuery({
    queryKey: ['get', '/api/student/diagnosis/last'],
    queryFn: async () => {
      const response = await client.GET('/api/student/diagnosis/last');
      return response.data ?? null;
    },
  });
};

export default useGetLastDiagnosis;