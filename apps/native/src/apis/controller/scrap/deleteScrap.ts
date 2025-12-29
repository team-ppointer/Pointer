import { useMutation, useQueryClient, QueryFilters } from '@tanstack/react-query';
import { client, TanstackQueryClient } from '@/apis/client';
import { paths } from '@/types/api/schema';
import type { ScrapSearchResponse } from '@/features/student/scrap/utils/types';

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
      const deletedIds = new Set(request.items.map((item) => `${item.type}-${item.id}`));

      // 모든 검색 쿼리의 이전 데이터 백업 및 낙관적 업데이트
      const searchQueryFilters: QueryFilters = {
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
      };

      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries(searchQueryFilters);

      // 이전 데이터 백업
      const previousQueries = queryClient.getQueriesData(searchQueryFilters);

      // 낙관적 업데이트: 삭제된 항목을 즉시 제거
      queryClient.setQueriesData<ScrapSearchResponse>(searchQueryFilters, (old) => {
        if (!old) return old;

        return {
          folders: old.folders?.filter((folder) => !deletedIds.has(`FOLDER-${folder.id}`)),
          scraps: old.scraps?.filter((scrap) => !deletedIds.has(`SCRAP-${scrap.id}`)),
        };
      });

      // 롤백을 위한 이전 데이터 반환
      return { previousQueries };
    },
    // 에러 발생 시 롤백
    onError: (error, request, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // 성공/실패 관계없이 쿼리 무효화 (백그라운드에서 최신 데이터 가져오기)
    onSettled: () => {
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
