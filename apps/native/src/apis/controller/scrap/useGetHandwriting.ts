import { useQuery } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type GetHandwritingResponse =
  paths['/api/student/scrap/{scrapId}/handwriting']['get']['responses']['200']['content']['*/*'];

export const useGetHandwriting = (scrapId: number, enabled = true) => {
  return useQuery({
    queryKey: ['scrap', 'handwriting', scrapId],
    queryFn: async (): Promise<GetHandwritingResponse> => {
      const { data } = await client.GET('/api/student/scrap/{scrapId}/handwriting', {
        params: {
          path: { scrapId },
        },
      });
      return data as GetHandwritingResponse;
    },
    enabled,
  });
};
