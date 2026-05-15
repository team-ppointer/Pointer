import { queryOptions } from '@tanstack/react-query';

import { client } from '@apis/client';

/**
 * Focus card queryOptions factory.
 *
 * 계층적 key 구조로 도메인 단위 invalidation 가능:
 *   queryClient.invalidateQueries({ queryKey: focusCardQueries.all() });
 *
 * 응답의 envelope(`requestId`/`total`)는 클라이언트에서 쓰지 않으므로 `data`만 추출해
 * `FocusCardIssuanceResp[]`로 반환한다.
 */
export const focusCardQueries = {
  all: () => ['student', 'focus-card'] as const,
  byDate: (date: string | undefined) =>
    queryOptions({
      queryKey: [...focusCardQueries.all(), { date }] as const,
      queryFn: async () => {
        const response = await client.GET('/api/student/focus-card', {
          params: { query: { date } },
        });
        return response.data?.data ?? [];
      },
      staleTime: 5 * 60 * 1000,
    }),
};
