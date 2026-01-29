import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@schema';
import { invalidateTrashMutationQueries } from './utils';

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
      // 휴지통 및 검색 쿼리 갱신
      invalidateTrashMutationQueries(queryClient);
    },
  });
};
