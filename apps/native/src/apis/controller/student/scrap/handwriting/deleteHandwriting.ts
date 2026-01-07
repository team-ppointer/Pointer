import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';

export const useDeleteHandwriting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scrapId: number): Promise<void> => {
      await client.DELETE('/api/student/scrap/{scrapId}/handwriting', {
        params: {
          path: { scrapId },
        },
      });
    },
    onSuccess: (_, scrapId) => {
      queryClient.invalidateQueries({ queryKey: ['scrap', 'handwriting', scrapId] });
      queryClient.invalidateQueries({ queryKey: ['scrap', 'detail', scrapId] });
    },
  });
};
