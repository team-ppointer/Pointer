import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@schema';
import { invalidateScrapSearchQueries, SCRAP_QUERY_KEYS } from './utils';

type UpdateFolderThumbnailRequest =
  paths['/api/student/scrap/folder/{id}/thumbnail']['put']['requestBody']['content']['application/json'];
type UpdateFolderThumbnailResponse =
  paths['/api/student/scrap/folder/{id}/thumbnail']['put']['responses']['200']['content']['*/*'];

interface UpdateFolderThumbnailParams {
  id: number;
  request: UpdateFolderThumbnailRequest;
}

export const useUpdateFolderThumbnail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: UpdateFolderThumbnailParams): Promise<UpdateFolderThumbnailResponse> => {
      const { data } = await client.PUT('/api/student/scrap/folder/{id}/thumbnail', {
        params: {
          path: { id },
        },
        body: request,
      });
      return data as UpdateFolderThumbnailResponse;
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
