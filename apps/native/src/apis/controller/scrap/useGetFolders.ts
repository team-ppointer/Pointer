import { TanstackQueryClient } from '@apis';

export const useGetFolders = () => {
  return TanstackQueryClient.useQuery('get', '/api/student/scrap/folder');
};
