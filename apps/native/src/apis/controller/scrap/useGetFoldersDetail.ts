import { TanstackQueryClient } from '@apis';

export const useGetFolderDetail = (id: number, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/scrap/folder/{id}',
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
