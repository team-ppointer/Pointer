import { TanstackQueryClient } from '@apis';

const getProblemsByPublishId = (publishId: string) => {
  return TanstackQueryClient.useQuery('get', '/api/v1/client/problem/{publishId}', {
    params: {
      path: {
        publishId: Number(publishId),
      },
    },
  });
};

export default getProblemsByPublishId;
