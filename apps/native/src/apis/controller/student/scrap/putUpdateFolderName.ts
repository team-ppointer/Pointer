import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@schema';
import { invalidateScrapSearchQueries, SCRAP_QUERY_KEYS } from './utils';

type UpdateFolderNameRequest =
  paths['/api/student/scrap/folder/{id}/name']['put']['requestBody']['content']['application/json'];
type UpdateFolderNameResponse =
  paths['/api/student/scrap/folder/{id}/name']['put']['responses']['200']['content']['*/*'];

interface UpdateFolderNameParams {
  id: number;
  request: UpdateFolderNameRequest;
}

export const useUpdateFolderName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: UpdateFolderNameParams): Promise<UpdateFolderNameResponse> => {
      const { data } = await client.PUT('/api/student/scrap/folder/{id}/name', {
        params: {
          path: { id },
        },
        body: request,
      });
      return data as UpdateFolderNameResponse;
    },
    onSuccess: () => {
      // 폴더 목록 갱신
      queryClient.invalidateQueries({
        queryKey: SCRAP_QUERY_KEYS.folderList(),
      });
      // 검색 결과 갱신
      invalidateScrapSearchQueries(queryClient);
    },
  });
};
