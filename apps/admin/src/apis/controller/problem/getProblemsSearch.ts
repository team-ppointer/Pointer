import { $api } from '@apis';
import { getProblemsSearchParamsType } from '@types';

const getProblemsSearch = (searchQuery: getProblemsSearchParamsType) => {
  return $api.useQuery('get', '/api/v1/problems/search', {
    params: {
      query: searchQuery,
    },
  });
};

export default getProblemsSearch;
