import { useQuery } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type GetFoldersResponse =
  paths['/api/student/scrap/folder']['get']['responses']['200']['content']['*/*'];

export const useGetFolders = () => {
  return useQuery({
    queryKey: ['scrap', 'folders'],
    queryFn: async (): Promise<GetFoldersResponse> => {
      const { data } = await client.GET('/api/student/scrap/folder');
      return data as GetFoldersResponse;
    },
  });
};
