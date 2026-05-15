import { $api } from '@apis';
import { ActionGraphSheetSearchOptions } from '@types';

const getSheetActionEdge = (params: ActionGraphSheetSearchOptions = {}) => {
  return $api.useQuery('get', '/api/admin/concept/graph/sheet/action-edge', {
    params: {
      query: params,
    },
  });
};

export default getSheetActionEdge;
