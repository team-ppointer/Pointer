import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type paths } from '@schema';

import {
  optimisticMoveScrap,
  rollbackOptimisticUpdate,
  invalidateScrapSearchQueries,
  invalidateFolderScrapsQueries,
  SCRAP_QUERY_KEYS,
} from './utils';

import { client } from '@/apis/client';

type MoveScrapsRequest =
  paths['/api/student/scrap/move']['put']['requestBody']['content']['application/json'];
type MoveScrapsResponse =
  paths['/api/student/scrap/move']['put']['responses']['200']['content']['*/*'];

export const useMoveScraps = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: MoveScrapsRequest): Promise<MoveScrapsResponse> => {
      const { data } = await client.PUT('/api/student/scrap/move', {
        body: request,
      });
      return data as MoveScrapsResponse;
    },
    // 낙관적 업데이트: 이동된 스크랩의 folderId 변경
    onMutate: async (request) => {
      // scrapIds를 items 형태로 변환 (타입은 항상 SCRAP)
      const items = request.scrapIds.map((id) => ({ id, type: 'SCRAP' as const }));
      return await optimisticMoveScrap(queryClient, items, request.targetFolderId);
    },
    // 에러 발생 시 롤백
    onError: (error, request, context) => {
      if (context?.previousQueries) {
        rollbackOptimisticUpdate(queryClient, context.previousQueries);
      }
    },
    // 성공/실패 관계없이 쿼리 무효화
    onSettled: () => {
      // 폴더 목록 갱신
      queryClient.invalidateQueries({
        queryKey: SCRAP_QUERY_KEYS.folderList(),
      });
      // 폴더별 스크랩 목록 갱신
      invalidateFolderScrapsQueries(queryClient);
      // 검색 결과 갱신
      invalidateScrapSearchQueries(queryClient);
    },
  });
};
