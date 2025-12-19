import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';

type UnscrapFromProblemRequest =
  paths['/api/student/scrap/from-problem']['delete']['requestBody']['content']['application/json'];

/**
 * 문제에서 스크랩 취소 (휴지통 처리)
 * @description 문제 기반 스크랩을 취소하고 휴지통으로 이동합니다.
 */
export const useUnscrapFromProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UnscrapFromProblemRequest): Promise<void> => {
      await client.DELETE('/api/student/scrap/from-problem', {
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
