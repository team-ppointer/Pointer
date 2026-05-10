import { $api } from '@apis';
import { ConceptEdgeSheetSearchOptions } from '@types';

const getSheetEdge = (params: ConceptEdgeSheetSearchOptions = {}) => {
  return $api.useQuery('get', '/api/admin/concept/graph/sheet/edge', {
    params: {
      query: params,
    },
  });
};

export default getSheetEdge;
