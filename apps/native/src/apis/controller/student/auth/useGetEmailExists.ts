import { TanstackQueryClient } from '@/apis/client';

type Props = {
  email: string;
  enabled?: boolean;
};

const useGetEmailExists = ({ email, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery('get', '/api/student/auth/email/exists', {
    params: {
      query: {
        email,
      },
    },
    enabled: enabled && email.trim().length > 0,
  });
};

export default useGetEmailExists;