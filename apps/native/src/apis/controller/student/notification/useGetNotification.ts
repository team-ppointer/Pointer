import { TanstackQueryClient } from '@/apis/client';

type Props = {
  dayLimit?: number;
  enabled?: boolean;
};

const useGetNotification = ({ dayLimit, enabled = true }: Props) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/notification',
    {
      params: {
        query: { dayLimit },
      },
    },
    { enabled }
  );
};

export default useGetNotification;
