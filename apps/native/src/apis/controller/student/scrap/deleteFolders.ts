import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type paths } from '@schema';
import { client } from '@/apis/client';
import type { ScrapSearchResponse } from '@/features/student/scrap/utils/types';

import {
  createSearchQueryFilters,
  rollbackOptimisticUpdate,
  invalidateScrapSearchQueries,
  SCRAP_QUERY_KEYS,
} from './utils';

type DeleteFoldersRequest =
  paths['/api/student/scrap/folder']['delete']['requestBody']['content']['application/json'];

export const useDeleteFolders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: DeleteFoldersRequest): Promise<void> => {
      await client.DELETE('/api/student/scrap/folder', {
        body: request,
      });
    },
    // 낙관적 업데이트: 삭제 전 데이터 백업 및 즉시 UI 업데이트
    onMutate: async (request) => {
      const deletedFolderIds = new Set(request);

      // 폴더 목록 쿼리 취소 및 백업
      const folderQueryKey = SCRAP_QUERY_KEYS.folderList();
      await queryClient.cancelQueries({ queryKey: folderQueryKey });
      const previousFolders = queryClient.getQueryData(folderQueryKey);

      // 검색 쿼리 취소 및 백업
      const searchQueryFilters = createSearchQueryFilters();
      await queryClient.cancelQueries(searchQueryFilters);
      const previousQueries = queryClient.getQueriesData(searchQueryFilters);

      // 낙관적 업데이트: 폴더 목록에서 삭제된 폴더 제거
      queryClient.setQueryData(folderQueryKey, (old: { data?: { id: number }[] } | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((folder: { id: number }) => !deletedFolderIds.has(folder.id)),
        };
      });

      // 낙관적 업데이트: 검색 결과에서 삭제된 폴더 제거
      queryClient.setQueriesData<ScrapSearchResponse>(searchQueryFilters, (old) => {
        if (!old) return old;
        return {
          folders: old.folders?.filter((folder) => !deletedFolderIds.has(folder.id)),
          scraps: old.scraps,
        };
      });

      // 롤백을 위한 이전 데이터 반환
      return { previousFolders, previousQueries };
    },
    // 에러 발생 시 롤백
    onError: (error, request, context) => {
      if (context?.previousFolders) {
        const folderQueryKey = SCRAP_QUERY_KEYS.folderList();
        queryClient.setQueryData(folderQueryKey, context.previousFolders);
      }
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
      // 검색 결과 갱신
      invalidateScrapSearchQueries(queryClient);
      // 휴지통 목록 갱신
      queryClient.invalidateQueries({
        queryKey: SCRAP_QUERY_KEYS.trashList(),
      });
    },
  });
};
