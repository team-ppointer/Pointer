import { useQuery } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type GetScrapDetailResponse =
  paths['/api/student/scrap/{id}']['get']['responses']['200']['content']['*/*'];

export const useGetScrapDetail = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ['scrap', 'detail', id],
    queryFn: async (): Promise<GetScrapDetailResponse> => {
      const { data } = await client.GET('/api/student/scrap/{id}', {
        params: {
          path: { id },
        },
      });
      return data as GetScrapDetailResponse;
    },
    enabled,
  });
};
