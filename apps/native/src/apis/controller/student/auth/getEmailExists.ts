import { client, TanstackQueryClient } from '@/apis/client';

export const getEmailExists = async (email: string) => {
  const { data } = await client.GET('/api/student/auth/email/exists', {
    params: {
      query: {
        email,
      },
    },
  });
  return data;
};

type UseGetEmailExistsProps = {
  email: string;
  enabled?: boolean;
};

export const useGetEmailExists = ({ email, enabled = true }: UseGetEmailExistsProps) => {
  return TanstackQueryClient.useQuery('get', '/api/student/auth/email/exists', {
    params: {
      query: {
        email,
      },
    },
    enabled: enabled && email.trim().length > 0,
  });
};
