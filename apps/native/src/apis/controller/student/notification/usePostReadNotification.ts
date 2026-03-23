import { useMutation } from '@tanstack/react-query';

import { client } from '@/apis/client';

type Options = {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
};

const usePostReadNotification = (options?: Options) => {
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await client.POST('/api/student/notification/read/{notificationId}', {
        params: {
          path: { notificationId },
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default usePostReadNotification;
