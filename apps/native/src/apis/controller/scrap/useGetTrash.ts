import { TanstackQueryClient } from '@apis';

export const useGetTrash = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/scrap/trash');
};
