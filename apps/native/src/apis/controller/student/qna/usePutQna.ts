import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type components } from '@schema';
import { TanstackQueryClient, client } from '@/apis/client';

type QnAUpdateRequest = components['schemas']['QnAUpdateRequest'];

type MutationVariables = {
  qnaId: number;
  data: QnAUpdateRequest;
};

type Options = {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
};

const usePutQna = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ qnaId, data }: MutationVariables) => {
      const response = await client.PUT('/api/student/qna/{qnaId}', {
        params: {
          path: { qnaId },
        },
        body: data,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna', {}).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/{qnaId}', {
          params: {
            path: { qnaId: variables.qnaId },
          },
        }).queryKey,
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default usePutQna;
