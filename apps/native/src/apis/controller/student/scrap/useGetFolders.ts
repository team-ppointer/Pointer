import { TanstackQueryClient } from '@/apis/client';

export const useGetFolders = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/scrap/folder');
};
