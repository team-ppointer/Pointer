import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TanstackQueryClient, client } from '@apis';
import { components } from '@schema';

type ChatCreateRequest = components['schemas']['ChatCreateRequest'];

type Options = {
  qnaId?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
};

const usePostQnaChat = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChatCreateRequest) => {
      const response = await client.POST('/api/student/qna/chat', {
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

export default usePostQnaChat;
