/**
 * Scrap 기능 전역 상수
 */

/**
 * 그리드 레이아웃 설정
 */
export const GRID_CONFIG = {
  /** 그리드 아이템 간 간격 (px) */
  GAP: 22,
  /** 그리드 아이템 최소 너비 (px) */
  MIN_ITEM_WIDTH: 136,
  /** 그리드 아이템 너비:높이 비율 */
  ITEM_HEIGHT_RATIO: 1.15,
  /** 최소 컬럼 수 */
  MIN_COLUMNS: 2,
} as const;

/**
 * 애니메이션 및 UI 딜레이 설정 (ms)
 */
export const ANIMATION_DELAYS = {
  /** 팝오버 닫기 딜레이 */
  POPOVER_CLOSE: 100,
  /** 모달 닫기 딜레이 */
  MODAL_CLOSE: 200,
  /** 즉시 실행 (다음 이벤트 루프) */
  IMMEDIATE: 0,
} as const;

/**
 * 정렬 기본값
 */
export const DEFAULT_SORT = {
  /** 기본 정렬 키 */
  KEY: 'DATE' as const,
  /** 기본 정렬 순서 */
  ORDER: 'DESC' as const,
} as const;
