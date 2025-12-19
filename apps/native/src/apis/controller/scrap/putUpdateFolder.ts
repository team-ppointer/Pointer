import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
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
