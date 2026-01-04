import {
  type ScrapItem,
  type TrashItem,
  type UISortKey,
  type SortOrder,
  parseTimestamp,
} from '@/features/student/scrap/utils/types';

/**
 * 스크랩 데이터 정렬 함수
 *
 * @param list - 정렬할 스크랩/휴지통 아이템 목록
 * @param key - 정렬 키 (TYPE, TITLE, DATE)
 * @param order - 정렬 방향 (ASC, DESC)
 * @returns 정렬된 아이템 목록
 *
 * @description
 * - TYPE: 폴더가 스크랩보다 먼저 표시, 같은 타입 내에서는 생성일시 기준
 * - TITLE: 이름 기준 (한글 로케일 지원)
 * - DATE: 생성일시 기준
 */
export const sortScrapData = <T extends ScrapItem | TrashItem>(
  list: T[],
  key: UISortKey,
  order: SortOrder
): T[] => {
  const mul = order === 'ASC' ? 1 : -1;

  const sorted = [...list].sort((a, b) => {
    switch (key) {
      case 'TYPE': {
        // 타입 우선 정렬 (FOLDER가 SCRAP보다 먼저)
        if (a.type !== b.type) {
          return (a.type === 'FOLDER' ? -1 : 1) * mul;
        }
        // 같은 타입: 생성일시 기준
        const timestampA = parseTimestamp(a.createdAt);
        const timestampB = parseTimestamp(b.createdAt);
        return (timestampA - timestampB) * mul;
      }

      case 'TITLE': {
        // 이름 기준 (한글 로케일 지원)
        return a.name.localeCompare(b.name, 'ko', { numeric: true }) * mul;
      }

      case 'DATE': {
        // 생성일시 기준
        const timestampA = parseTimestamp(a.createdAt);
        const timestampB = parseTimestamp(b.createdAt);
        return (timestampA - timestampB) * mul;
      }

      default:
        return 0;
    }
  });

  return sorted;
};

/**
 * UI 정렬 키를 API 정렬 키로 변환
 *
 * @param uiKey - UI 정렬 키 (TYPE, TITLE, DATE)
 * @returns API 정렬 키 (CREATED_AT, NAME)
 *
 * @description
 * - TYPE, DATE → CREATED_AT (서버에서 생성일시 기준 정렬)
 * - TITLE → NAME (서버에서 이름 기준 정렬)
 */
export const mapUIKeyToAPIKey = (uiKey: UISortKey): 'CREATED_AT' | 'NAME' => {
  switch (uiKey) {
    case 'TYPE':
    case 'DATE':
      return 'CREATED_AT';
    case 'TITLE':
      return 'NAME';
    default:
      return 'CREATED_AT';
  }
};
