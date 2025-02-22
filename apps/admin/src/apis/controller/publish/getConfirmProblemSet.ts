import { getSearchProblemSetParamsType } from '@types';
import { $api } from 'src/apis/client';

const getConfirmProblemSet = (searchQuery: getSearchProblemSetParamsType) => {
  return $api.useQuery('get', '/api/v1/problemSet/confirm/search', {
    params: {
      query: searchQuery,
    },
  });
};

export default getConfirmProblemSet;
