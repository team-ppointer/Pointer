import { $api } from '@apis';
import { GetPublishByIdParams } from '@types';

const getPublishById = (params: GetPublishByIdParams) => {
  return $api.useQuery('get', '/api/admin/publish/{id}', {
    params: {
      path: params,
    },
  });
};

export default getPublishById;
