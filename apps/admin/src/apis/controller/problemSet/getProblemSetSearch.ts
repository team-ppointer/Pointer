import { $api } from '@apis';
import { GetProblemSetSearchParams } from '@types';

const getProblemSetSearch = (params: GetProblemSetSearchParams) => {
  return $api.useQuery('get', '/api/admin/problem-set', {
    params: {
      query: params,
    },
  });
};

export default getProblemSetSearch;
