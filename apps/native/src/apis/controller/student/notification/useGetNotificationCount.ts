import { TanstackQueryClient } from '@/apis/client';

type Props = {
  enabled?: boolean;
};

const useGetNotificationCount = ({ enabled = true }: Props) => {
  return TanstackQueryClient.useQuery('get', '/api/student/notification/count', { enabled });
};

export default useGetNotificationCount;
