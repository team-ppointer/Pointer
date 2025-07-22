import { $api } from '@apis';

const getProblemSetById = (problemSetId: number) => {
  return $api.useQuery('get', '/api/admin/problem-set/{id}', {
    params: {
      path: {
        id: problemSetId,
      },
    },
  });
};

export default getProblemSetById;
