import { $api } from '@apis';

const getProblemById = (problemId: number) => {
  return $api.useQuery('get', '/api/admin/problem/{id}', {
    params: {
      path: {
        id: problemId,
      },
    },
  });
};

export default getProblemById;
