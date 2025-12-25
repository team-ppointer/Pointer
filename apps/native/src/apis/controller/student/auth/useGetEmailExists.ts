import { TanstackQueryClient } from '@apis';

const useGetEmailExists = (email: string) => {
  return TanstackQueryClient.useQuery('get', '/api/student/auth/email/exists', {
    query: {
      email,
    },
  });
};

export default useGetEmailExists;