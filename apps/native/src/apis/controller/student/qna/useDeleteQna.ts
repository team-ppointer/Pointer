import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TanstackQueryClient, client } from '@/apis/client';

type Options = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const useDeleteQna = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qnaId: number) => {
      const response = await client.DELETE('/api/student/qna/{qnaId}', {
        params: {
          path: { qnaId },
        },
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna', {}).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/qna/images', {}).queryKey,
      });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export default useDeleteQna;
