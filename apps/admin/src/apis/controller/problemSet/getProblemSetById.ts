import { $api } from '@apis';
import { GetProblemSetByIdParams } from '@types';

const getProblemSetById = (params: GetProblemSetByIdParams) => {
  return $api.useQuery('get', '/api/admin/problem-set/{id}', {
    params: {
      path: params,
    },
  });
};

export default getProblemSetById;
