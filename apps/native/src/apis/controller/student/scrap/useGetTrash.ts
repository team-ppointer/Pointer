import { TanstackQueryClient } from '@/apis/client';

export const useGetTrash = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/scrap/trash');
};
