import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type DeleteScrapRequest =
  paths['/api/student/scrap']['delete']['requestBody']['content']['application/json'];

export const useDeleteScrap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: DeleteScrapRequest
    ): Promise<{ success: boolean; request: DeleteScrapRequest }> => {
      await client.DELETE('/api/student/scrap', {
        body: request,
      });

      return { success: true, request };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap'] });
      queryClient.invalidateQueries({ queryKey: ['scrap', 'trash'] });
    },
  });
};
