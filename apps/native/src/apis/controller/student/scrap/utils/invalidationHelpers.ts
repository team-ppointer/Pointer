import { QueryClient } from '@tanstack/react-query';
import {
  isScrapSearchQuery,
  isFolderScrapsQuery,
  isFolderScrapsQueryByFolderId,
  isTrashQuery,
  isRecentScrapQuery,
  isScrapRelatedQuery,
} from './queryFilters';

/**
 * 스크랩 검색 쿼리를 무효화
 * 스크랩/폴더 생성, 수정, 삭제 시 사용
 */
export const invalidateScrapSearchQueries = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: isScrapSearchQuery,
  });
};

/**
 * 폴더 스크랩 목록 쿼리를 무효화
 * 스크랩 이동, 삭제 시 사용
 */
export const invalidateFolderScrapsQueries = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: isFolderScrapsQuery,
  });
};

/**
 * 특정 폴더의 스크랩 목록 쿼리를 무효화
 * @param queryClient - Query Client 인스턴스
 * @param folderId - 폴더 ID
 */
export const invalidateFolderScrapsByFolderId = (
  queryClient: QueryClient,
  folderId: number
): void => {
  queryClient.invalidateQueries({
    predicate: isFolderScrapsQueryByFolderId(folderId),
  });
};

/**
 * 휴지통 목록 쿼리를 무효화
 * 휴지통 항목 삭제, 복구 시 사용
 */
export const invalidateTrashQueries = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: isTrashQuery,
  });
};

/**
 * 최근 스크랩 목록 쿼리를 무효화
 * 스크랩 생성, 수정 시 사용
 */
export const invalidateRecentScrapQueries = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: isRecentScrapQuery,
  });
};

/**
 * 스크랩 관련 모든 쿼리를 무효화
 * 대규모 변경 또는 전체 갱신이 필요한 경우 사용
 */
export const invalidateAllScrapQueries = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: isScrapRelatedQuery,
  });
};

/**
 * 스크랩 검색 및 폴더 스크랩 목록 쿼리를 동시에 무효화
 * 스크랩 삭제, 이동 시 주로 사용
 */
export const invalidateScrapSearchAndFolderQueries = (queryClient: QueryClient): void => {
  invalidateScrapSearchQueries(queryClient);
  invalidateFolderScrapsQueries(queryClient);
};

/**
 * 스크랩 생성/수정 시 필요한 쿼리들을 무효화
 * 검색 쿼리와 최근 스크랩 쿼리를 갱신
 */
export const invalidateScrapMutationQueries = (queryClient: QueryClient): void => {
  invalidateScrapSearchQueries(queryClient);
  invalidateRecentScrapQueries(queryClient);
};

/**
 * 휴지통 관련 작업 시 필요한 쿼리들을 무효화
 * 휴지통 쿼리와 스크랩 검색 쿼리를 갱신
 */
export const invalidateTrashMutationQueries = (queryClient: QueryClient): void => {
  invalidateTrashQueries(queryClient);
  invalidateScrapSearchQueries(queryClient);
};
