import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type DeleteScrapRequest =
  paths['/api/student/scrap']['delete']['requestBody']['content']['application/json'];

export const useDeleteScrap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: DeleteScrapRequest
    ): Promise<{ success: boolean; request: DeleteScrapRequest }> => {
      await client.DELETE('/api/student/scrap', {
        body: request,
      });

      return { success: true, request };
    },
    onSuccess: () => {
      // 폴더 목록 갱신
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/scrap/folder').queryKey,
      });
      // 폴더 내 스크랩 목록 갱신 (모든 폴더의 스크랩 목록 쿼리 무효화)
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 2 &&
            key[0] === 'get' &&
            typeof key[1] === 'string' &&
            key[1].includes('/api/student/scrap/folder/') &&
            key[1].includes('/scraps')
          );
        },
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
      // 휴지통 목록 갱신
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/scrap/trash').queryKey,
      });
    },
  });
};
