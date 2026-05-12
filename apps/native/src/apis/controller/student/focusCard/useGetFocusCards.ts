import { useQuery } from '@tanstack/react-query';

import { focusCardQueries } from './queries';

/**
 * 특정 날짜에 발급된 집중학습 카드 조회.
 * `date` 미지정 시 서버 기본값(오늘) 사용.
 */
const useGetFocusCards = (date?: string) => {
  return useQuery(focusCardQueries.byDate(date));
};

export default useGetFocusCards;
