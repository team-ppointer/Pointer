import { useMutation } from '@tanstack/react-query';

import { client } from '@/apis/client';

type Options = {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
};

const usePostReadAllNotification = (options?: Options) => {
  return useMutation({
    mutationFn: async () => {
      const response = await client.POST('/api/student/notification/read-all', {});
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

export default usePostReadAllNotification;
