import { getSearchProblemSetParamsType } from '@types';
import { $api } from '@apis';

const getSearchProblemSet = (searchQuery: getSearchProblemSetParamsType) => {
  return $api.useQuery('get', '/api/admin/problem-set', {
    params: {
      query: searchQuery,
    },
  });
};

export default getSearchProblemSet;
