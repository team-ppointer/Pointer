import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type PermanentDeleteRequest =
  paths['/api/student/scrap/trash']['delete']['requestBody']['content']['application/json'];

export const usePermanentDeleteTrash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PermanentDeleteRequest): Promise<void> => {
      await client.DELETE('/api/student/scrap/trash', {
        body: request,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap', 'trash'] });
    },
  });
};
