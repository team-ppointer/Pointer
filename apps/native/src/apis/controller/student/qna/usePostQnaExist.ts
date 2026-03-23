import { useMutation } from '@tanstack/react-query';
import { type components } from '@schema';

import { client } from '@/apis/client';

type QnACheckRequest = components['schemas']['QnACheckRequest'];

type Options = {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
};

const usePostQnaExist = (options?: Options) => {
  return useMutation({
    mutationFn: async (data: QnACheckRequest) => {
      const response = await client.POST('/api/student/qna/exist', {
        body: data,
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

export default usePostQnaExist;
