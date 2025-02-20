import { $api } from 'src/apis/client';

const getProblemById = (problemId: number) => {
  return $api.useQuery('get', '/api/v1/problems/{id}', {
    params: {
      path: {
        id: problemId,
      },
    },
  });
};

export default getProblemById;
