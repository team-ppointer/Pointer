import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type RestoreTrashRequest =
  paths['/api/student/scrap/trash/restore']['put']['requestBody']['content']['application/json'];

export const useRestoreTrash = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RestoreTrashRequest): Promise<void> => {
      await client.PUT('/api/student/scrap/trash/restore', {
        body: request,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap'] });
      queryClient.invalidateQueries({ queryKey: ['scrap', 'trash'] });
    },
  });
};
