import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client, TanstackQueryClient } from '@/apis/client';

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
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions(
          'get',
          '/api/student/scrap/{scrapId}/handwriting',
          { params: { path: { scrapId } } }
        ).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/scrap/{id}', {
          params: { path: { id: scrapId } },
        }).queryKey,
      });
    },
  });
};
