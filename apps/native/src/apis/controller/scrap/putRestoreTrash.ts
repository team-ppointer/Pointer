import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
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
      // 휴지통 목록 갱신
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/scrap/trash').queryKey,
      });
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
