import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TanstackQueryClient, client } from '@/apis/client';

type Options = {
  qnaId?: number;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const useDeleteQnaChat = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatId: number) => {
      const response = await client.DELETE('/api/student/qna/chat/{chatId}', {
        params: {
          path: { chatId },
        },
      });
      return response.data;
    },
    onSuccess: () => {
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
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default useDeleteQnaChat;
