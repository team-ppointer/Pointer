import { TanstackQueryClient } from '@/apis/client';

type Props = {
  enabled?: boolean;
};

const useGetPushSetting = ({ enabled = true }: Props) => {
  return TanstackQueryClient.useQuery('get', '/api/student/me/push/settings', {
    enabled,
  });
};

export default useGetPushSetting;
