/**
 * 스크랩 관련 Query Keys 상수
 * @tanstack/react-query의 쿼리 키 패턴 사용
 */
export const SCRAP_QUERY_KEYS = {
  /** 폴더 목록 쿼리 키 */
  folderList: () => ['get', '/api/student/scrap/folder'] as const,

  /** 휴지통 목록 쿼리 키 */
  trashList: () => ['get', '/api/student/scrap/trash'] as const,

  /** 최근 스크랩 목록 쿼리 키 */
  recentScrapList: () => ['get', '/api/student/scrap/recent'] as const,

  /** 특정 폴더의 스크랩 목록 쿼리 키 */
  folderScraps: (folderId: number) =>
    [
      'get',
      '/api/student/scrap/folder/{folderId}/scraps',
      { params: { path: { folderId } } },
    ] as const,

  /** 스크랩 상세 정보 쿼리 키 */
  scrapDetail: (scrapId: number) =>
    ['get', '/api/student/scrap/{scrapId}', { params: { path: { scrapId } } }] as const,

  /** 폴더 상세 정보 쿼리 키 */
  folderDetail: (folderId: number) =>
    ['get', '/api/student/scrap/folder/{folderId}', { params: { path: { folderId } } }] as const,
} as const;
