import { TanstackQueryClient } from '@/apis/client';

export const useGetScrapStatusById = (problemId: number, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/scrap/by-problem/{problemId}',
    {
      params: {
        path: { problemId },
      },
    },
    {
      enabled,
    }
  );
};
