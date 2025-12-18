import { Action, State } from '../../utils/reducer';

/**
 * 기본 UI Props - API 스키마에 맞춤
 */
export interface BaseItemUIProps {
  /** 아이템 ID (number) */
  id: number;
  /** 아이템 이름 */
  name: string;
  /** 생성일시 (ISO 8601 string) */
  createdAt: string;
}

/**
 * 선택 가능한 아이템 Props
 */
export interface SelectableUIProps {
  reducerState?: State;
  dispatch?: React.Dispatch<Action>;
  onCheckPress?: () => void;
}

/**
 * 스크랩 카드 Props
 */
export interface ScrapCardProps extends BaseItemUIProps, SelectableUIProps {
  type: 'SCRAP';
  /** 썸네일 URL */
  thumbnailUrl?: string;
  /** 소속 폴더 ID */
  folderId?: number;
}

/**
 * 폴더 카드 Props
 * API의 ScrapListItemResp에서는 폴더 내 아이템 수만 제공
 */
export interface FolderCardProps extends BaseItemUIProps, SelectableUIProps {
  type: 'FOLDER';
  /** 폴더 내 스크랩 개수 (API에서 제공하지 않으면 별도 조회 필요) */
  scrapCount?: number;
}

/**
 * 스크랩 목록 아이템 Props (Union Type)
 */
export type ScrapListItemProps = ScrapCardProps | FolderCardProps;
