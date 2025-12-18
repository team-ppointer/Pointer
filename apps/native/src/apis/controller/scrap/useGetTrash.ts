import { useQuery } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type GetTrashResponse =
  paths['/api/student/scrap/trash']['get']['responses']['200']['content']['*/*'];

export const useGetTrash = () => {
  return useQuery({
    queryKey: ['scrap', 'trash'],
    queryFn: async (): Promise<GetTrashResponse> => {
      const { data } = await client.GET('/api/student/scrap/trash');
      return data as GetTrashResponse;
    },
  });
};
