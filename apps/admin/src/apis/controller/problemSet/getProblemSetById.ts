import { $api } from 'src/apis/client';

const getProblemSetById = (problemSetId: number) => {
  return $api.useQuery('get', '/api/v1/problemSet/{problemSetId}', {
    params: {
      path: {
        problemSetId: problemSetId,
      },
    },
  });
};

export default getProblemSetById;
