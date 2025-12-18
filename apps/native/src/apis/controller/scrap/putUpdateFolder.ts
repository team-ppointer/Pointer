import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type UpdateFolderRequest =
  paths['/api/student/scrap/folder/{id}']['put']['requestBody']['content']['application/json'];
type UpdateFolderResponse =
  paths['/api/student/scrap/folder/{id}']['put']['responses']['200']['content']['*/*'];

interface UpdateFolderParams {
  id: number;
  request: UpdateFolderRequest;
}

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: UpdateFolderParams): Promise<UpdateFolderResponse> => {
      const { data } = await client.PUT('/api/student/scrap/folder/{id}', {
        params: {
          path: { id },
        },
        body: request,
      });
      return data as UpdateFolderResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrap', 'folders'] });
      queryClient.invalidateQueries({ queryKey: ['scrap', 'search'] });
    },
  });
};
