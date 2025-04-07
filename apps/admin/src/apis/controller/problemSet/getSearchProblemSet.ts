import { getSearchProblemSetParamsType } from '@types';
import { $api } from '@apis';

const getSearchProblemSet = (searchQuery: getSearchProblemSetParamsType) => {
  return $api.useQuery('get', '/api/v1/problemSet/search', {
    params: {
      query: searchQuery,
    },
  });
};

export default getSearchProblemSet;
