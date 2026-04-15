import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

interface SplitPanelLayoutOptions {
  /** 좌측 패널의 외부 수평 마진 총합 (px). 기본 20 (m-[10px] 양옆). */
  leftMargin?: number;
  /** 좌측 패널 최소 너비 (px). 기본 352 (744/2 − padding). */
  leftMin?: number;
  /** 좌측 패널 최대 너비 (px). 기본 410 (chat 가독성 cap). */
  leftMax?: number;
  /** 좌측 패널 비율 (0–1). 기본 0.4 (4:6). */
  leftRatio?: number;
}

interface SplitPanelLayout {
  leftWidth: number;
  rightWidth: number;
}

/**
 * 좌우 split panel 비율 + clamp 를 반응형으로 계산한다.
 *
 * - 기본 4:6 비율, 좌측 [352, 410] clamp
 * - `useWindowDimensions` 기반이라 회전 / 분할뷰 / 창 크기 변경에 자동 반응
 * - PointingScreen, AnalysisScreen, AllPointingsScreen 등에서 공유
 */
export function useSplitPanelLayout(options?: SplitPanelLayoutOptions): SplitPanelLayout {
  const { leftMargin = 20, leftMin = 352, leftMax = 410, leftRatio = 0.4 } = options ?? {};

  const { width: windowWidth } = useWindowDimensions();

  return useMemo(() => {
    const usable = Math.max(0, windowWidth - leftMargin);
    const target = Math.floor(usable * leftRatio);
    const left = Math.min(leftMax, Math.max(leftMin, target));
    const right = Math.max(0, usable - left);
    return { leftWidth: left, rightWidth: right };
  }, [windowWidth, leftMargin, leftMin, leftMax, leftRatio]);
}
