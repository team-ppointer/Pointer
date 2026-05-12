import { useQuery } from '@tanstack/react-query';

import { client } from '@/apis/client';

/**
 * 특정 일자 데일리 코멘트 조회.
 * `commentDate` 미지정 시 서버 기본값(오늘) 사용.
 */
const useGetDailyComments = (commentDate?: string) => {
  return useQuery({
    queryKey: ['get', '/api/student/daily-comments', commentDate],
    queryFn: async () => {
      const response = await client.GET('/api/student/daily-comments', {
        params: { query: { commentDate } },
      });
      return response.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetDailyComments;
