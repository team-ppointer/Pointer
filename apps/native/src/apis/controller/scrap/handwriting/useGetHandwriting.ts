import { TanstackQueryClient } from '@apis';

export const useGetHandwriting = (scrapId: number, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/scrap/{scrapId}/handwriting',
    {
      params: {
        path: { scrapId },
      },
    },
    {
      enabled,
    }
  );
};
