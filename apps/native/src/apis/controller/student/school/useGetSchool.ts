import { TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type SchoolParams = paths['/api/student/school']['get']['parameters']['query'];

const useGetSchool = (params: SchoolParams = {}, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/school',
    {
      params: {
        query: params,
      },
    },
    {
      enabled,
    }
  );
};

export default useGetSchool;
