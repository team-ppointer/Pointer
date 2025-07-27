import { $api } from '@apis';
import { getProblemsSearchParamsType } from '@types';

const getProblemsSearch = (searchQuery: getProblemsSearchParamsType) => {
  return $api.useQuery('get', '/api/admin/problem', {
    params: {
      query: searchQuery,
    },
  });
};

export default getProblemsSearch;
