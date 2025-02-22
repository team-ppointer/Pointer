import { $api } from '@apis';
import { getProblemsSearchParamsType } from '@types';

const getProblemsSearch = (searchQuery: getProblemsSearchParamsType) => {
  return $api.useQuery(
    'get',
    '/api/v1/problems/search',
    {
      params: {
        query: searchQuery,
      },
    },
    {
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60 * 24,
    }
  );
};

export default getProblemsSearch;
