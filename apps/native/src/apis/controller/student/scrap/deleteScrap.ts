import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/apis/client';
import { type paths } from '@schema';

import {
  optimisticDeleteScrap,
  rollbackOptimisticUpdate,
  invalidateScrapSearchQueries,
  invalidateFolderScrapsQueries,
  SCRAP_QUERY_KEYS,
} from './utils';

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
    // 낙관적 업데이트: 삭제 전 데이터 백업 및 즉시 UI 업데이트
    onMutate: async (request) => {
      return await optimisticDeleteScrap(queryClient, request.items);
    },
    // 에러 발생 시 롤백
    onError: (error, request, context) => {
      if (context?.previousQueries) {
        rollbackOptimisticUpdate(queryClient, context.previousQueries);
      }
    },
    // 성공/실패 관계없이 쿼리 무효화 (백그라운드에서 최신 데이터 가져오기)
    onSettled: () => {
      // 폴더 목록 갱신
      queryClient.invalidateQueries({
        queryKey: SCRAP_QUERY_KEYS.folderList(),
      });
      // 폴더 내 스크랩 목록 갱신
      invalidateFolderScrapsQueries(queryClient);
      // 검색 결과 갱신
      invalidateScrapSearchQueries(queryClient);
      // 휴지통 목록 갱신
      queryClient.invalidateQueries({
        queryKey: SCRAP_QUERY_KEYS.trashList(),
      });
    },
  });
};
