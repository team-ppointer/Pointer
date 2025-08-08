import { $api } from '@apis';
import { GetPublishParams } from '@types';

const getPublish = (params: GetPublishParams) => {
  return $api.useQuery('get', '/api/admin/publish', {
    params: {
      query: params,
    },
  });
};

export default getPublish;
