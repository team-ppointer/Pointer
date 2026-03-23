import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type components } from '@schema';

import { TanstackQueryClient, client } from '@/apis/client';

type ChatUpdateRequest = components['schemas']['ChatUpdateRequest'];

type MutationVariables = {
  chatId: number;
  data: ChatUpdateRequest;
};

type Options = {
  qnaId?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
};

const usePutQnaChat = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, data }: MutationVariables) => {
      const response = await client.PUT('/api/student/qna/chat/{chatId}', {
        params: {
          path: { chatId },
        },
        body: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (options?.qnaId) {
        void queryClient.invalidateQueries({
          queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/{qnaId}', {
            params: {
              path: { qnaId: options.qnaId },
            },
          }).queryKey,
        });
      }
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/admin-chat', {})
          .queryKey,
      });
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default usePutQnaChat;
