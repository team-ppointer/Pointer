import { TanstackQueryClient } from '@apis';

export const useGetScrapDetail = (id: number, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/scrap/{id}',
    {
      params: {
        path: { id },
      },
    },
    {
      enabled,
    }
  );
};
