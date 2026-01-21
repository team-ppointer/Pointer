import { TanstackQueryClient } from '@/apis/client';
import { paths } from '@schema';

type SearchScrapsParams = paths['/api/student/scrap/search']['get']['parameters']['query'];

export const useSearchScraps = (params: SearchScrapsParams = {}, enabled = true) => {
  return TanstackQueryClient.useQuery(
    'get',
    '/api/student/scrap/search',
    {
      params: {
        query: params,
      },
    },
    {
      enabled,
    }
  );
};
