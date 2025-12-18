import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type DeleteFoldersRequest =
  paths['/api/student/scrap/folder']['delete']['requestBody']['content']['application/json'];

export const useDeleteFolders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: DeleteFoldersRequest): Promise<void> => {
      await client.DELETE('/api/student/scrap/folder', {
        body: request,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap', 'folders'] });
      queryClient.invalidateQueries({ queryKey: ['scrap', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['scrap', 'trash'] });
    },
  });
};
