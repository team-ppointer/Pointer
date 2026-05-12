import { useQuery } from '@tanstack/react-query';

import { client } from '@/apis/client';

/**
 * 특정 날짜에 발급된 집중학습 카드 조회.
 * `date` 미지정 시 서버 기본값(오늘) 사용.
 */
const useGetFocusCards = (date?: string) => {
  return useQuery({
    queryKey: ['get', '/api/student/focus-card', date],
    queryFn: async () => {
      const response = await client.GET('/api/student/focus-card', {
        params: { query: { date } },
      });
      return response.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetFocusCards;
