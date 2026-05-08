import { $api } from '@apis';
import { ConceptNodeSheetSearchOptions } from '@types';

const getSheetNode = (params: ConceptNodeSheetSearchOptions = {}) => {
  return $api.useQuery('get', '/api/admin/concept/graph/sheet/node', {
    params: {
      query: params,
    },
  });
};

export default getSheetNode;
