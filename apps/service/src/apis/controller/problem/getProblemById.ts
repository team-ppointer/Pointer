import { TanstackQueryClient } from '@apis';

const getProblemById = (publishId: string, problemId: string) => {
  return TanstackQueryClient.useQuery('get', '/api/v1/client/problem/{publishId}/{problemId}', {
    params: {
      path: {
        publishId: Number(publishId),
        problemId: Number(problemId),
      },
    },
  });
};

export default getProblemById;
