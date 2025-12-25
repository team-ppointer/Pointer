import { TanstackQueryClient } from '@apis';

const useGetSchool = (query: string) => {
  return TanstackQueryClient.useQuery('get', '/api/student/school', {
    query: {
      query,
    },
  });
};

export default useGetSchool;
