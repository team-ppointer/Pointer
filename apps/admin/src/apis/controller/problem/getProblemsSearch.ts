import { $api } from '@apis';
import { getProblemsSearchParamsType } from '@types';

const getProblemsSearch = (search: getProblemsSearchParamsType) => {
  return $api.useQuery('get', '/api/v1/problems/search', {
    params: {
      query: search,
    },
  });
};

export default getProblemsSearch;
