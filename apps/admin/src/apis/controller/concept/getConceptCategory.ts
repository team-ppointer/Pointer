import { $api } from '@apis';
import { GetConceptCategoryParams } from '@types';

const getConceptCategory = (params: GetConceptCategoryParams = {}) => {
  return $api.useQuery('get', '/api/admin/concept/category', {
    params: {
      query: params,
    },
  });
};

export default getConceptCategory;
