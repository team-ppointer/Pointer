import { components } from '@/types/api/schema';

type ScrapExtendResp = components['schemas']['ScrapDetailResp'];

export interface PointingWithLabel {
  id: number;
  no: number;
  questionContent?: string;
  commentContent?: string;
  concepts?: Array<{ id: number; name: string }>;
  label: string;
}

/**
 * 필터 옵션 목록을 생성합니다.
 * @param scrapDetail - 스크랩 상세 정보
 * @param pointingsWithLabels - 레이블이 추가된 포인팅 목록
 * @returns 필터 옵션 문자열 배열
 */
export function generateFilterOptions(
  scrapDetail: ScrapExtendResp | undefined,
  pointingsWithLabels: PointingWithLabel[]
): string[] {
  if (!scrapDetail) return ['전체', '문제'];

  const options = ['스크랩 전체', '문제'];

  if (pointingsWithLabels.length > 0) {
    pointingsWithLabels.forEach((pointing) => {
      options.push(`포인팅 ${pointing.label}`);
    });
  }

  if (scrapDetail.isReadingTipScrapped) {
    options.push('문제를 읽어내려갈 때');
  }
  if (scrapDetail.isOneStepMoreScrapped) {
    options.push('한 걸음 더');
  }

  return options;
}

/**
 * 선택된 필터에 따라 문제를 표시할지 결정합니다.
 * @param selectedFilter - 선택된 필터 인덱스 (0: 전체, 1: 문제, 2+: 포인팅)
 * @returns 문제 표시 여부
 */
export function shouldShowProblem(selectedFilter: number): boolean {
  return selectedFilter === 0 || selectedFilter === 1;
}

/**
 * 선택된 필터에 따라 특정 포인팅을 표시할지 결정합니다.
 * @param selectedFilter - 선택된 필터 인덱스 (0: 전체, 1: 문제, 2+: 포인팅)
 * @param pointingIndex - 포인팅 인덱스
 * @returns 포인팅 표시 여부
 */
export function shouldShowPointing(selectedFilter: number, pointingIndex: number): boolean {
  if (selectedFilter === 0) return true; // 전체
  if (selectedFilter === 1) return false; // 문제만
  return selectedFilter === pointingIndex + 2; // 특정 포인팅만
}

export function shouldShowAnalysisSection(
  selectedFilter: number,
  sectionType: 'readingTip' | 'oneStepMore',
  pointingsCount: number
): boolean {
  // 전체 선택 시 모두 표시
  if (selectedFilter === 0) return true;

  // readingTip 인덱스: pointingsCount + 2
  // oneStepMore 인덱스: pointingsCount + 3
  const readingTipIndex = pointingsCount + 2;
  const oneStepMoreIndex = pointingsCount + 3;

  if (sectionType === 'readingTip') {
    return selectedFilter === readingTipIndex;
  }
  if (sectionType === 'oneStepMore') {
    return selectedFilter === oneStepMoreIndex;
  }
  return false;
}

/**
 * 표시할 포인팅이 있는지 확인합니다.
 * @param scrapDetail - 스크랩 상세 정보
 * @param selectedFilter - 선택된 필터 인덱스
 * @returns 표시할 포인팅 존재 여부
 */
export function hasVisiblePointings(
  scrapDetail: ScrapExtendResp | undefined,
  selectedFilter: number
): boolean {
  if (!scrapDetail?.pointings || scrapDetail.pointings.length === 0) return false;
  if (selectedFilter === 1) return false; // 문제만 선택 시 포인팅 숨김
  if (selectedFilter === 0) return true; // 전체 선택 시 포인팅 표시

  // 특정 포인팅 선택 시 해당 포인팅이 존재하는지 확인
  const pointingIndex = selectedFilter - 2;
  return pointingIndex >= 0 && pointingIndex < scrapDetail.pointings.length;
}
