import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type UnscrapFromPointingRequest =
  paths['/api/student/scrap/from-pointing']['delete']['requestBody']['content']['application/json'];

/**
 * 포인팅에서 스크랩 취소 (다른 포인팅이 없으면 휴지통 처리)
 * @description 포인팅 기반 스크랩을 취소하고, 다른 포인팅이 없으면 휴지통으로 이동합니다.
 */
export const useUnscrapFromPointing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UnscrapFromPointingRequest): Promise<void> => {
      await client.DELETE('/api/student/scrap/from-pointing', {
        body: request,
      });
    },
    onSuccess: () => {
      // 휴지통 목록 갱신
      queryClient.invalidateQueries({
        queryKey: TanstackQueryClient.queryOptions('get', '/api/student/scrap/trash').queryKey,
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
