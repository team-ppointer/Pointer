import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type paths } from '@schema';
import { client } from '@/apis/client';

import { invalidateTrashMutationQueries } from './utils';

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
      // 휴지통 및 검색 쿼리 갱신
      invalidateTrashMutationQueries(queryClient);
    },
  });
};
