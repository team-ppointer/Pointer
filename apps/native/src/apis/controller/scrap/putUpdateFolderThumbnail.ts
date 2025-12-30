import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

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
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/scrap/folder').queryKey,
      });
      // 검색 결과 갱신 (모든 검색 쿼리 무효화)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 2 &&
            key[0] === 'get' &&
            typeof key[1] === 'string' &&
            key[1].includes('/api/student/scrap/search')
          );
        },
      });
    },
  });
};

