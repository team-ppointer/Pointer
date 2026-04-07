import { $api } from '@apis';
import { GetProblemByIdParams } from '@types';

const getProblemById = (params: GetProblemByIdParams) => {
  return $api.useQuery('get', '/api/admin/problem/{id}', {
    params: {
      path: params,
    },
  });
};

export default getProblemById;
