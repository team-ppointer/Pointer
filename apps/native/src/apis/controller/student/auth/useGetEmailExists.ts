import { TanstackQueryClient } from '@apis';

type Props = {
  email: string;
  enabled?: boolean;
};

const useGetEmailExists = ({ email, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery('get', '/api/student/auth/email/exists', {
    query: {
      email,
    },
    enabled: enabled && email.trim().length > 0,
  });
};

export default useGetEmailExists;