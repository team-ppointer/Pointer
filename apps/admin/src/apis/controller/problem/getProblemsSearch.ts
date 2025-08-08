import { $api } from '@apis';
import { GetProblemsSearchParams } from '@types';

const getProblemsSearch = (searchQuery: GetProblemsSearchParams) => {
  return $api.useQuery('get', '/api/admin/problem', {
    params: {
      query: searchQuery,
    },
  });
};

export default getProblemsSearch;
