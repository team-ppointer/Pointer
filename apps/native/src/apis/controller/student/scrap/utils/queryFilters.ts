import { type Query } from '@tanstack/react-query';

/**
 * 스크랩 검색 API 쿼리 필터
 * /api/student/scrap/search 관련 쿼리를 필터링
 */
export const isScrapSearchQuery = (query: Query): boolean => {
  const key = query.queryKey;
  return (
    Array.isArray(key) &&
    key.length >= 2 &&
    key[0] === 'get' &&
    typeof key[1] === 'string' &&
    key[1].includes('/api/student/scrap/search')
  );
};

/**
 * 폴더 스크랩 목록 API 쿼리 필터
 * /api/student/scrap/folder/{folderId}/scraps 관련 쿼리를 필터링
 */
export const isFolderScrapsQuery = (query: Query): boolean => {
  const key = query.queryKey;
  return (
    Array.isArray(key) &&
    key.length >= 2 &&
    key[0] === 'get' &&
    typeof key[1] === 'string' &&
    key[1].includes('/api/student/scrap/folder') &&
    key[1].includes('/scraps')
  );
};

/**
 * 특정 폴더의 스크랩 목록 쿼리 필터
 * @param folderId - 폴더 ID
 */
export const isFolderScrapsQueryByFolderId = (folderId: number) => {
  return (query: Query): boolean => {
    const key = query.queryKey;
    return (
      Array.isArray(key) &&
      key.length >= 2 &&
      key[0] === 'get' &&
      typeof key[1] === 'string' &&
      key[1].includes(`/api/student/scrap/folder/${folderId}/scraps`)
    );
  };
};

/**
 * 휴지통 목록 API 쿼리 필터
 * /api/student/scrap/trash 관련 쿼리를 필터링
 */
export const isTrashQuery = (query: Query): boolean => {
  const key = query.queryKey;
  return (
    Array.isArray(key) &&
    key.length >= 2 &&
    key[0] === 'get' &&
    typeof key[1] === 'string' &&
    key[1].includes('/api/student/scrap/trash')
  );
};

/**
 * 최근 스크랩 목록 API 쿼리 필터
 * /api/student/scrap/recent 관련 쿼리를 필터링
 */
export const isRecentScrapQuery = (query: Query): boolean => {
  const key = query.queryKey;
  return (
    Array.isArray(key) &&
    key.length >= 2 &&
    key[0] === 'get' &&
    typeof key[1] === 'string' &&
    key[1].includes('/api/student/scrap/recent')
  );
};

/**
 * 스크랩 관련 모든 쿼리 필터
 * /api/student/scrap 관련 모든 쿼리를 필터링
 */
export const isScrapRelatedQuery = (query: Query): boolean => {
  const key = query.queryKey;
  return (
    Array.isArray(key) &&
    key.length >= 2 &&
    key[0] === 'get' &&
    typeof key[1] === 'string' &&
    key[1].includes('/api/student/scrap')
  );
};
