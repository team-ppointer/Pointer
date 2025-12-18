import { useQuery } from '@tanstack/react-query';
import { client } from '@/apis/client';
import { paths } from '@/types/api/schema';

type SearchScrapsParams = paths['/api/student/scrap/search/all']['get']['parameters']['query'];
type SearchScrapsResponse =
  paths['/api/student/scrap/search/all']['get']['responses']['200']['content']['*/*'];

export const useSearchScraps = (params: SearchScrapsParams = {}, enabled = true) => {
  return useQuery({
    queryKey: ['scrap', 'search', params],
    queryFn: async (): Promise<SearchScrapsResponse> => {
      const { data } = await client.GET('/api/student/scrap/search/all', {
        params: {
          query: params,
        },
      });
      return data as SearchScrapsResponse;
    },
    enabled,
  });
};
