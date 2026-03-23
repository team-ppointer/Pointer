import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type components } from '@schema';

import { TanstackQueryClient, client } from '@/apis/client';

type QnACreateRequest = components['schemas']['QnACreateRequest'];

type Options = {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
};

const usePostQna = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QnACreateRequest) => {
      const response = await client.POST('/api/student/qna', {
        body: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna', {}).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/files', {}).queryKey,
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default usePostQna;
