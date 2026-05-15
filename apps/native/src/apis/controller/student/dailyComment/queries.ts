import { queryOptions } from '@tanstack/react-query';

import { client } from '@apis/client';

/**
 * Daily comment queryOptions factory.
 *
 * 계층적 key 구조로 도메인 단위 invalidation 가능:
 *   queryClient.invalidateQueries({ queryKey: dailyCommentQueries.all() });
 */
export const dailyCommentQueries = {
  all: () => ['student', 'daily-comment'] as const,
  byDate: (commentDate: string | undefined) =>
    queryOptions({
      queryKey: [...dailyCommentQueries.all(), { commentDate }] as const,
      queryFn: async () => {
        const response = await client.GET('/api/student/daily-comments', {
          params: { query: { commentDate } },
        });
        return response.data ?? [];
      },
      staleTime: 5 * 60 * 1000,
    }),
};
