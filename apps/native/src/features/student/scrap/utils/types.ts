import { paths, components } from '@/types/api/schema';

/**
 * API 응답 타입 추출
 */
export type ScrapSearchResponse =
  paths['/api/student/scrap/search']['get']['responses']['200']['content']['*/*'];
export type TrashResponse =
  paths['/api/student/scrap/trash']['get']['responses']['200']['content']['*/*'];

/**
 * API 스키마 기반 기본 타입
 */
export type ScrapListItemResp = components['schemas']['ScrapListItemResp'];
export type ScrapDetailResp = components['schemas']['ScrapDetailResp'];
export type ScrapFolderResp = components['schemas']['ScrapFolderResp'];

/**
 * 스크랩 아이템 유니언 타입
 * - API의 ScrapListItemResp를 기반으로 함
 * - type 필드로 FOLDER/SCRAP 구분
 */
export type ScrapItem = ScrapListItemResp;

/**
 * 휴지통 아이템 타입 (API 스키마)
 * API의 TrashItemResp를 직접 사용
 */
export type TrashItemResp = components['schemas']['TrashItemResp'];

/**
 * 휴지통 아이템 (정렬을 위한 확장 타입)
 * - createdAt이 없으므로 deletedAt을 사용하여 정렬
 */
export type TrashItem = TrashItemResp & {
  /** 정렬을 위한 createdAt (deletedAt으로 설정) */
  createdAt: string;
};

/**
 * 정렬 키 타입
 * API의 sort 파라미터에 맞춤 (CREATED_AT, NAME)
 */
export type ApiSortKey = 'CREATED_AT' | 'NAME' | 'TYPE' | 'SIMILARITY';

/**
 * UI 정렬 키 타입 (TYPE은 클라이언트 전용)
 */
export type UISortKey = 'TYPE' | 'NAME' | 'DATE';

/**
 * 정렬 방향 타입
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * 필터 타입
 */
export type FilterType = 'ALL' | 'FOLDER' | 'SCRAP';

/**
 * 검색 파라미터 타입
 */
export type SearchScrapParams = {
  folderId?: number;
  query?: string;
  filter?: FilterType;
  sort?: ApiSortKey;
  order?: SortOrder;
  page?: number;
  size?: number;
};

/**
 * UI 헬퍼: timestamp를 Date로 변환
 */
export const parseTimestamp = (dateString: string): number => {
  return new Date(dateString).getTime();
};
