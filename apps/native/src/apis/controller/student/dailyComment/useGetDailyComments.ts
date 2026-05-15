import { useQuery } from '@tanstack/react-query';

import { dailyCommentQueries } from './queries';

/**
 * 특정 일자 데일리 코멘트 조회.
 * `commentDate` 미지정 시 서버 기본값(오늘) 사용.
 */
const useGetDailyComments = (commentDate?: string) => {
  return useQuery(dailyCommentQueries.byDate(commentDate));
};

export default useGetDailyComments;
