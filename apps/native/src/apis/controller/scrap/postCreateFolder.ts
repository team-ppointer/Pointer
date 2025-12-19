import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type CreateFolderRequest =
  paths['/api/student/scrap/folder']['post']['requestBody']['content']['application/json'];
type CreateFolderResponse =
  paths['/api/student/scrap/folder']['post']['responses']['200']['content']['*/*'];

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateFolderRequest): Promise<CreateFolderResponse> => {
      const { data } = await client.POST('/api/student/scrap/folder', {
        body: request,
      });
      return data as CreateFolderResponse;
    },
    onSuccess: () => {
      // 폴더 목록 갱신 (정확한 queryKey 사용)
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
