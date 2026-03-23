import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client, TanstackQueryClient } from '@/apis/client';
import { type components } from '@schema';

type UpdatePushSettingsRequest = components['schemas']['StudentPushDTO.UpdateSettingsRequest'];

const usePutAllowPush = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePushSettingsRequest) => {
      const response = await client.PUT('/api/student/me/push/settings', {
        body: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/me/push/settings').queryKey,
      });
    },
  });
};

export default usePutAllowPush;
