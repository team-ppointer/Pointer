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

  // 낙관적 업데이트: 삭제된 항목을 즉시 제거 + 폴더 정보 업데이트
  queryClient.setQueriesData<ScrapSearchResponse>(searchQueryFilters, (old) => {
    if (!old) return old;

    // 삭제되는 스크랩들의 folderId별 개수 계산
    const folderCountDeltas = new Map<number, number>();
    old.scraps?.forEach((scrap) => {
      if (deletedIds.has(`SCRAP-${scrap.id}`) && scrap.folderId != null) {
        folderCountDeltas.set(scrap.folderId, (folderCountDeltas.get(scrap.folderId) ?? 0) + 1);
      }
    });

    return {
      folders: old.folders
        ?.filter((folder) => !deletedIds.has(`FOLDER-${folder.id}`))
        .map((folder) => ({
          ...folder,
          scrapCount: (folder.scrapCount ?? 0) - (folderCountDeltas.get(folder.id) ?? 0),
        })),
      scraps: old.scraps?.filter((scrap) => !deletedIds.has(`SCRAP-${scrap.id}`)),
    };
  });

  return { previousQueries };
};

/**
 * 스크랩 이동 낙관적 업데이트
 * @param targetFolderId 이동할 폴더 ID (undefined면 전체 스크랩으로 이동)
 * @returns 롤백을 위한 이전 데이터
 */
export const optimisticMoveScrap = async (
  queryClient: QueryClient,
  items: Array<{ id: number; type: string }>,
  targetFolderId?: number
) => {
  const movedIds = createDeletedIdsSet(items);
  const searchQueryFilters = createSearchQueryFilters();

  // 진행 중인 쿼리 취소
  await queryClient.cancelQueries(searchQueryFilters);

  // 이전 데이터 백업
  const previousQueries = queryClient.getQueriesData(searchQueryFilters);

  // 낙관적 업데이트: 이동된 스크랩의 folderId 변경
  // 스크랩 이동 시 폴더 정보도 업데이트
  queryClient.setQueriesData<ScrapSearchResponse>(searchQueryFilters, (old) => {
    if (!old) return old;

    // 이동되는 스크랩들의 원래 folderId 수집
    const sourceFolderCounts = new Map<number, number>();
    old.scraps?.forEach((scrap) => {
      if (movedIds.has(`SCRAP-${scrap.id}`) && scrap.folderId != null) {
        sourceFolderCounts.set(scrap.folderId, (sourceFolderCounts.get(scrap.folderId) ?? 0) + 1);
      }
    });

    return {
      folders: old.folders?.map((folder) => {
        const removedCount = sourceFolderCounts.get(folder.id) ?? 0;
        const addedCount =
          folder.id === targetFolderId ? items.filter((item) => item.type === 'SCRAP').length : 0;
        //  const addedCount =
        //   folder.id === targetFolderId ? items.filter((item) => item.type === 'SCRAP').length : 0;

        return {
          ...folder,
          scrapCount: (folder.scrapCount ?? 0) - removedCount + addedCount,
        };
      }),
      scraps: old.scraps?.map((scrap) =>
        movedIds.has(`SCRAP-${scrap.id}`) ? { ...scrap, folderId: targetFolderId } : scrap
      ),
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
