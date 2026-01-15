import { QueryClient, QueryFilters } from '@tanstack/react-query';
import type { ScrapSearchResponse } from '@/features/student/scrap/utils/types';
import { isScrapSearchQuery } from './queryFilters';

/**
 * 삭제할 항목 ID 세트 생성
 */
export const createDeletedIdsSet = (items: Array<{ id: number; type: string }>): Set<string> => {
  return new Set(items.map((item) => `${item.type}-${item.id}`));
};

/**
 * 검색 쿼리 필터 생성
 */
export const createSearchQueryFilters = (): QueryFilters => ({
  predicate: isScrapSearchQuery,
});

/**
 * 스크랩 삭제 낙관적 업데이트
 * @returns 롤백을 위한 이전 데이터
 */
export const optimisticDeleteScrap = async (
  queryClient: QueryClient,
  items: Array<{ id: number; type: string }>
) => {
  const deletedIds = createDeletedIdsSet(items);
  const searchQueryFilters = createSearchQueryFilters();

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

  return { previousQueries };
};

/**
 * 스크랩 이동 낙관적 업데이트
 * @returns 롤백을 위한 이전 데이터
 */
export const optimisticMoveScrap = async (
  queryClient: QueryClient,
  items: Array<{ id: number; type: string }>
) => {
  const movedIds = createDeletedIdsSet(items);
  const searchQueryFilters = createSearchQueryFilters();

  // 진행 중인 쿼리 취소
  await queryClient.cancelQueries(searchQueryFilters);

  // 이전 데이터 백업
  const previousQueries = queryClient.getQueriesData(searchQueryFilters);

  // 낙관적 업데이트: 이동된 항목을 현재 폴더에서 제거
  queryClient.setQueriesData<ScrapSearchResponse>(searchQueryFilters, (old) => {
    if (!old) return old;

    return {
      folders: old.folders?.filter((folder) => !movedIds.has(`FOLDER-${folder.id}`)),
      scraps: old.scraps?.filter((scrap) => !movedIds.has(`SCRAP-${scrap.id}`)),
    };
  });

  return { previousQueries };
};

/**
 * 폴더 생성 낙관적 업데이트
 * @returns 롤백을 위한 이전 데이터
 */
export const optimisticCreateFolder = async (queryClient: QueryClient, folderName: string) => {
  const searchQueryFilters = createSearchQueryFilters();

  // 진행 중인 쿼리 취소
  await queryClient.cancelQueries(searchQueryFilters);

  // 이전 데이터 백업
  const previousQueries = queryClient.getQueriesData(searchQueryFilters);

  // 임시 ID 생성 (음수로 생성하여 실제 ID와 구분)
  const tempId = -Date.now();

  // 낙관적 업데이트: 새 폴더를 즉시 추가
  queryClient.setQueriesData<ScrapSearchResponse>(searchQueryFilters, (old) => {
    if (!old) return old;

    const newFolder = {
      id: tempId,
      name: folderName,
      scrapCount: 0,
      thumbnailUrl: undefined,
      top2ScrapThumbnail: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      folders: [newFolder, ...(old.folders ?? [])],
      scraps: old.scraps ?? [],
    };
  });

  return { previousQueries, tempId };
};

/**
 * 폴더 업데이트 낙관적 업데이트
 * @returns 롤백을 위한 이전 데이터
 */
export const optimisticUpdateFolder = async (
  queryClient: QueryClient,
  folderId: number,
  updates: { name?: string; parentFolderId?: number }
) => {
  const searchQueryFilters = createSearchQueryFilters();

  // 진행 중인 쿼리 취소
  await queryClient.cancelQueries(searchQueryFilters);

  // 이전 데이터 백업
  const previousQueries = queryClient.getQueriesData(searchQueryFilters);

  // 낙관적 업데이트: 폴더 정보를 즉시 변경
  queryClient.setQueriesData<ScrapSearchResponse>(searchQueryFilters, (old) => {
    if (!old) return old;

    return {
      folders: old.folders?.map((folder) =>
        folder.id === folderId
          ? {
              ...folder,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : folder
      ),
      scraps: old.scraps,
    };
  });

  return { previousQueries };
};

/**
 * 낙관적 업데이트 롤백
 * 에러 발생 시 이전 데이터로 복원
 */
export const rollbackOptimisticUpdate = (
  queryClient: QueryClient,
  previousQueries: readonly [queryKey: unknown, data: unknown][]
): void => {
  previousQueries.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey as any, data);
  });
};
